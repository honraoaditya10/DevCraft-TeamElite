"""Orchestration Agent (Supervisor) - coordinates all agents and workflow."""

from __future__ import annotations

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import json

from app.agents.document_processor import DocumentProcessingAgent
from app.agents.data_extractor import DataExtractionAgent
from app.agents.validator import ValidationAgent
from app.agents.scheme_analyzer import SchemeUnderstandingAgent
from app.agents.eligibility_decision import EligibilityDecisionAgent
from app.db.mongodb import get_db
from app.db.models import (
    DocumentRecord,
    DocumentStatusEnum,
    DocumentTypeEnum,
    EligibilityResult,
    EligibilityStatusEnum,
)


class OrchestrationAgent:
    """
    Orchestration Agent (Supervisor).
    
    Responsibilities:
    - Coordinate all agents
    - Manage workflow state
    - Handle database operations
    - Implement agentic behaviors (auto-recalculation, etc.)
    """

    def __init__(self):
        self.doc_processor = DocumentProcessingAgent()
        self.data_extractor = DataExtractionAgent()
        self.validator = ValidationAgent()
        self.scheme_analyzer = SchemeUnderstandingAgent()
        self.eligibility_agent = EligibilityDecisionAgent()
        self.db = get_db()

    def process_student_document_upload(
        self, user_id: str, raw_document_text: str, filename: str = ""
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Complete document processing pipeline.

        Orchestrates: Process → Extract → Validate → Store

        Returns:
            Tuple of (success, message, document_id)
        """
        if not self.db:
            return False, "Database not available", None

        try:
            # Step 1: Document Processing
            processed = self.doc_processor.run(raw_document_text, filename)
            cleaned_text = processed["cleaned_text"]
            doc_type = processed["document_type"]

            # Step 2: Data Extraction
            extracted_data, confidence = self.data_extractor.extract_from_document(
                cleaned_text, doc_type
            )

            # Step 3: Validation
            is_valid, errors, warnings = self.validator.validate_extracted_data(extracted_data)

            # Step 4: Store in MongoDB
            doc_record = {
                "user_id": user_id,
                "document_type": doc_type,
                "original_filename": filename,
                "extracted_data": extracted_data,
                "raw_text": cleaned_text,
                "status": "completed" if is_valid else "failed",
                "error_message": "; ".join(errors) if errors else None,
                "uploaded_at": datetime.utcnow(),
                "processed_at": datetime.utcnow(),
                "extraction_confidence": confidence,
                "validation_errors": errors,
                "validation_warnings": warnings,
            }

            result = self.db["documents"].insert_one(doc_record)
            document_id = str(result.inserted_id)

            if is_valid:
                # Trigger auto-eligibility recalculation
                self._trigger_eligibility_recalculation(user_id)
                return True, "Document processed successfully", document_id
            else:
                return False, f"Validation failed: {'; '.join(errors)}", document_id

        except Exception as e:
            return False, f"Error processing document: {str(e)}", None

    def extract_and_merge_student_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Extract all documents for a user and merge into complete profile.

        Returns:
            Complete student profile
        """
        if not self.db:
            return {}

        # Fetch all documents for user
        documents = list(self.db["documents"].find({"user_id": user_id, "status": "completed"}))

        extracted_docs = [doc.get("extracted_data", {}) for doc in documents]

        # Merge into profile
        result = self.data_extractor.extract_student_profile(extracted_docs)

        return result["profile"]

    def calculate_eligibility_for_user(self, user_id: str) -> Dict[str, Any]:
        """
        Calculate eligibility for a user against all schemes.

        Orchestrates: Get Profile → Load Schemes → Evaluate → Store Results

        Returns:
            Eligibility analysis
        """
        if not self.db:
            return {"error": "Database not available"}

        # Get user profile
        user_profile = self.extract_and_merge_student_profile(user_id)

        if not user_profile or not any(user_profile.values()):
            return {
                "eligible_schemes": [],
                "partial_match_schemes": [],
                "not_eligible_schemes": [],
                "overall_score": 0,
                "missing_requirements": ["Complete user profile"],
                "status": "incomplete_profile",
            }

        # Load all schemes
        schemes = list(self.db["schemes"].find({}))

        if not schemes:
            return {
                "eligible_schemes": [],
                "partial_match_schemes": [],
                "not_eligible_schemes": [],
                "overall_score": 0,
                "missing_requirements": ["No schemes available"],
                "status": "no_schemes",
            }

        # Evaluate against all schemes
        evaluations = self.eligibility_agent.batch_evaluate(user_profile, schemes)

        # Categorize results
        eligible = [e for e in evaluations if e["status"] == "eligible"]
        partial = [e for e in evaluations if e.get("match_score", 0) >= 50 and e["status"] != "eligible"]
        not_eligible = [e for e in evaluations if e["status"] == "not_eligible"]

        # Store results in MongoDB
        for eval_result in evaluations:
            result_doc = {
                "user_id": user_id,
                "scheme_name": eval_result.get("scheme_name"),
                "scheme_id": eval_result.get("scheme_id"),
                "status": eval_result.get("status"),
                "match_score": eval_result.get("match_score", 0),
                "reason": eval_result.get("reason"),
                "rule_details": eval_result.get("rule_details"),
                "missing_requirements": eval_result.get("missing_requirements"),
                "recalculated_at": datetime.utcnow(),
            }
            self.db["eligibility_results"].update_one(
                {"user_id": user_id, "scheme_id": eval_result.get("scheme_id")},
                {"$set": result_doc},
                upsert=True,
            )

        # Get missing requirements across all schemes
        all_missing = set()
        for eval_result in evaluations:
            for missing in eval_result.get("missing_requirements", []):
                all_missing.add(missing)

        # Compute overall score
        if evaluations:
            overall_score = sum(e.get("match_score", 0) for e in evaluations) / len(evaluations)
        else:
            overall_score = 0

        return {
            "user_id": user_id,
            "eligible_schemes": [
                {
                    "name": e["scheme_name"],
                    "score": e.get("match_score", 0),
                    "reason": e.get("reason"),
                }
                for e in eligible
            ],
            "partial_match_schemes": [
                {
                    "name": e["scheme_name"],
                    "score": e.get("match_score", 0),
                    "reason": e.get("reason"),
                    "missing": e.get("missing_requirements", [])[:3],  # Top 3 missing
                }
                for e in partial
            ],
            "not_eligible_schemes": [
                {
                    "name": e["scheme_name"],
                    "score": e.get("match_score", 0),
                    "reason": e.get("reason"),
                }
                for e in not_eligible
            ],
            "overall_score": int(overall_score),
            "missing_requirements": list(all_missing)[:10],  # Top 10
            "next_actions": self._generate_next_actions(eligible, partial),
            "recalculated_at": datetime.utcnow().isoformat(),
        }

    def _trigger_eligibility_recalculation(self, user_id: str):
        """Automatically recalculate eligibility when profile is updated."""
        if self.db:
            self.db["processing_queue"].insert_one({
                "user_id": user_id,
                "task_type": "eligibility_check",
                "status": "pending",
                "priority": 1,
                "created_at": datetime.utcnow(),
            })

    def _generate_next_actions(self, eligible: list, partial: list) -> List[str]:
        """Generate suggested next actions for user."""
        actions = []

        if not eligible and not partial:
            actions.append("Upload additional documents to improve eligibility")
            actions.append("Check if family income qualifies for income-based schemes")
        else:
            if eligible:
                actions.append(f"Apply for {len(eligible)} eligible scheme(s)")
            if partial:
                actions.append("Complete missing documents for partial matches")

        if len(eligible) == 0 and len(partial) == 0:
            actions.append("Contact support for eligibility guidance")

        return actions

    def load_scheme_from_document(self, scheme_text: str, scheme_name: str) -> Tuple[bool, str]:
        """
        Load a new scheme from admin-uploaded document.

        Returns:
            Tuple of (success, message)
        """
        if not self.db:
            return False, "Database not available"

        try:
            # Analyze scheme
            scheme_data = self.scheme_analyzer.analyze_scheme_document(scheme_text, scheme_name)

            # Store in MongoDB
            scheme_doc = {
                "scheme_name": scheme_name,
                "provider": scheme_data.get("metadata", {}).get("provider"),
                "description": scheme_data.get("metadata", {}).get("description"),
                "rules": scheme_data.get("rules", []),
                "required_documents": scheme_data.get("required_documents", []),
                "benefits": scheme_data.get("benefits", {}),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }

            result = self.db["schemes"].insert_one(scheme_doc)

            # Trigger automatic eligibility recalculation for all users
            self._trigger_all_user_eligibility_recalculation()

            return True, f"Scheme '{scheme_name}' loaded successfully"

        except Exception as e:
            return False, f"Error loading scheme: {str(e)}"

    def _trigger_all_user_eligibility_recalculation(self):
        """When new scheme is added, recalculate for all users."""
        if self.db:
            users = self.db["users"].find({})
            for user in users:
                self._trigger_eligibility_recalculation(str(user.get("_id")))

    def get_user_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """
        Get complete dashboard data for user.

        Returns:
            All user data for dashboard
        """
        if not self.db:
            return {}

        # Get user profile
        user = self.db["users"].find_one({"_id": user_id})

        # Get documents
        documents = list(self.db["documents"].find({"user_id": user_id}))

        # Get eligibility results
        results = list(self.db["eligibility_results"].find({"user_id": user_id}))

        # Calculate profile completion
        profile_fields = [
            "full_name", "gender", "category", "annual_income",
            "domicile_state", "marks_percentage"
        ]
        completed_fields = sum(1 for field in profile_fields if user and user.get(field))
        profile_completion = (completed_fields / len(profile_fields)) * 100 if user else 0

        return {
            "user": user,
            "documents": documents,
            "eligibility_results": results,
            "profile_completion": profile_completion,
            "next_actions": self._generate_dashboard_actions(documents, results),
        }

    def _generate_dashboard_actions(self, documents: list, eligibility_results: list) -> List[str]:
        """Generate actionable next steps."""
        actions = []

        if len(documents) < 3:
            actions.append("Upload more documents for better accuracy")

        eligible_count = sum(1 for r in eligibility_results if r.get("status") == "eligible")
        if eligible_count > 0:
            actions.append(f"Apply for {eligible_count} eligible scheme(s)")
        else:
            actions.append("Complete profile to improve eligibility")

        return actions
