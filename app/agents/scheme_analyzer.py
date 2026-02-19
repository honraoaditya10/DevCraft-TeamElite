"""Scheme Understanding Agent - parses scheme PDFs and extracts rules."""

from __future__ import annotations

import json
from typing import Dict, Any, List
from enum import Enum

from app.services.llm_service import LLMService


class SchemeUnderstandingAgent:
    """
    Scheme Understanding Agent.
    
    Responsibilities:
    - Read admin-uploaded scheme PDFs
    - Extract policy text
    - Convert to structured rule format
    - Build decision trees
    """

    def __init__(self):
        self.llm = LLMService()

    def analyze_scheme_document(self, scheme_text: str, scheme_name: str) -> Dict[str, Any]:
        """
        Analyze scheme document and extract rules.

        Args:
            scheme_text: Extracted text from scheme PDF
            scheme_name: Name of the scheme

        Returns:
            Structured scheme rules and metadata
        """
        # Extract basic metadata
        metadata = self._extract_metadata(scheme_text, scheme_name)

        # Extract eligibility rules
        rules = self._extract_rules(scheme_text)

        # Extract required documents
        required_docs = self._extract_required_documents(scheme_text)

        # Extract benefits
        benefits = self._extract_benefits(scheme_text)

        return {
            "scheme_name": scheme_name,
            "metadata": metadata,
            "rules": rules,
            "required_documents": required_docs,
            "benefits": benefits,
            "confidence": 0.85,
        }

    def _extract_metadata(self, text: str, scheme_name: str) -> Dict[str, Any]:
        """Extract metadata like provider, deadline, duration."""
        prompt = f"""
Extract scheme metadata from this document:

{text[:1000]}

Return JSON with:
{{
  "provider": "...",
  "description": "...",
  "deadline": "YYYY-MM-DD",
  "annual_budget": null,
  "max_beneficiaries": null
}}
"""
        try:
            result = self.llm.call_json(
                system_prompt="Extract scheme metadata accurately.",
                user_prompt=prompt,
            )
            return result
        except Exception:
            return {"provider": "Unknown", "description": ""}

    def _extract_rules(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract eligibility rules from scheme document.

        Returns rules in standardized format.
        """
        prompt = f"""
Extract all eligibility criteria from this scheme document:

{text[:2000]}

For each criterion, identify:
1. Field name (e.g., "income", "category", "state", "marks")
2. Operator (=, <, >, <=, >=, in, not_in)
3. Value
4. Description

Return JSON array:
[
  {{
    "field": "annual_income",
    "operator": "<",
    "value": 500000,
    "description": "Maximum annual income limit"
  }},
  {{
    "field": "category",
    "operator": "in",
    "value": ["SC", "ST", "OBC"],
    "description": "Eligible social categories"
  }}
]

Extract ALL rules found:
"""
        try:
            result = self.llm.call_json(
                system_prompt="Extract scheme eligibility rules as JSON array.",
                user_prompt=prompt,
            )
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and "rules" in result:
                return result["rules"]
            return []
        except Exception:
            return []

    def _extract_required_documents(self, text: str) -> List[str]:
        """Extract list of required documents."""
        prompt = f"""
List all required supporting documents mentioned in this scheme:

{text[:1500]}

Return JSON:
{{
  "documents": ["income_certificate", "caste_certificate", ...]
}}
"""
        try:
            result = self.llm.call_json(
                system_prompt="Extract required documents from scheme.",
                user_prompt=prompt,
            )
            return result.get("documents", [])
        except Exception:
            return []

    def _extract_benefits(self, text: str) -> Dict[str, Any]:
        """Extract benefit details."""
        prompt = f"""
Summarize the benefits offered by this scheme:

{text[:1500]}

Return JSON:
{{
  "description": "...",
  "monetary_benefit": null,
  "benefit_type": "...",
  "maximum_duration": "..."
}}
"""
        try:
            result = self.llm.call_json(
                system_prompt="Extract scheme benefits.",
                user_prompt=prompt,
            )
            return result
        except Exception:
            return {}

    def build_rule_tree(self, rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Build logical decision tree from rules.

        This allows efficient eligibility checking.
        """
        tree = {
            "type": "AND",  # All rules must be satisfied
            "conditions": [],
        }

        for rule in rules:
            tree["conditions"].append({
                "field": rule.get("field"),
                "operator": rule.get("operator"),
                "value": rule.get("value"),
                "description": rule.get("description", ""),
            })

        return tree
