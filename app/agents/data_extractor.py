"""Data Extraction Agent - transforms unstructured text to structured JSON."""

from __future__ import annotations

import json
from typing import Dict, Any, Tuple, Optional
from pathlib import Path

from app.services.llm_service import LLMService


class DataExtractionAgent:
    """
    Data Extraction Agent.
    
    Responsibilities:
    - Transform unstructured text into structured JSON
    - Extract all required fields
    - Handle missing or ambiguous data
    """

    def __init__(self):
        self.llm = LLMService()

    def extract_from_document(self, cleaned_text: str, doc_type: str) -> Tuple[Dict[str, Any], float]:
        """
        Extract structured data from document text.

        Args:
            cleaned_text: Cleaned document text
            doc_type: Type of document

        Returns:
            Tuple of (extracted_data, confidence_score)
        """
        prompt = self._build_extraction_prompt(cleaned_text, doc_type)

        try:
            extracted = self.llm.call_json(
                system_prompt="You are a data extraction expert. Extract all relevant information and return strict JSON only.",
                user_prompt=prompt,
            )
            confidence = extracted.get("confidence", 0.0)
            data = extracted.get("data", {})
            return data, confidence
        except Exception as e:
            return {}, 0.0

    def _build_extraction_prompt(self, text: str, doc_type: str) -> str:
        """Build extraction prompt based on document type."""
        base_prompt = f"""
Extract structured data from this {doc_type} document.

Document Text:
{text}

Rules:
- Extract ONLY information that is explicitly mentioned
- For missing fields, set to null
- For dates, use format YYYY-MM-DD
- For amounts, use numeric values
- Return strict JSON only, no markdown

Return JSON:
{{
  "data": {{
    "full_name": "...",
    "gender": "...",
    "category": "...",
    "annual_income": null,
    "issued_date": "...",
    "valid_till": "...",
    "authority": "...",
    "domicile_state": "...",
    "study_state": "..."
  }},
  "confidence": 0.0,
  "notes": "..."
}}
"""
        return base_prompt

    def extract_student_profile(self, documents: list) -> Dict[str, Any]:
        """
        Merge data from multiple documents into complete student profile.

        Args:
            documents: List of extracted document data

        Returns:
            Merged student profile
        """
        profile = {
            "full_name": None,
            "gender": None,
            "category": None,
            "annual_income": None,
            "domicile_state": None,
            "study_state": None,
            "marks_percentage": None,
            "disability_status": None,
            "religion": None,
            "course_level": None,
            "confidence": 0.0,
        }

        # Merge all documents
        confidences = []
        for doc_data in documents:
            if not doc_data:
                continue

            for key in profile:
                if key != "confidence" and doc_data.get(key) is not None:
                    profile[key] = doc_data.get(key)

            if "confidence" in doc_data:
                confidences.append(doc_data["confidence"])

        # Compute average confidence
        if confidences:
            profile["confidence"] = sum(confidences) / len(confidences)

        # Check for missing critical fields
        missing = self._check_missing_fields(profile)

        return {
            "profile": profile,
            "missing_fields": missing,
            "is_complete": len(missing) == 0,
        }

    def _check_missing_fields(self, profile: Dict[str, Any]) -> list:
        """Check which required fields are missing."""
        required_fields = [
            "full_name",
            "gender",
            "category",
            "annual_income",
            "domicile_state",
        ]
        missing = []
        for field in required_fields:
            if profile.get(field) is None:
                missing.append(field)
        return missing
