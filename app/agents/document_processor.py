"""Document Processing Agent - handles OCR and text extraction."""

from __future__ import annotations

import json
from typing import Dict, Any, Tuple, Optional
from pathlib import Path

from app.services.llm_service import LLMService


class DocumentProcessingAgent:
    """
    Document Processing Agent.
    
    Responsibilities:
    - Accept uploaded PDFs/images
    - Run OCR if needed (detects if document is scanned)
    - Clean raw text
    - Detect document type
    """

    def __init__(self):
        self.llm = LLMService()
        self.doc_type_prompt = Path(__file__).resolve().parents[1] / "prompts" / "document_type_detection.txt"

    def run(self, raw_text: str, filename: str = "") -> Dict[str, Any]:
        """
        Process uploaded document.

        Args:
            raw_text: Extracted text from document
            filename: Original filename for hints

        Returns:
            Processed document data with type and cleaned text
        """
        # Step 1: Detect if document is scanned (would use OCR in production)
        is_scanned = self._detect_if_scanned(raw_text)

        # Step 2: Clean text if needed
        cleaned_text = self._clean_text(raw_text)

        # Step 3: Detect document type
        doc_type = self._detect_document_type(cleaned_text, filename)

        return {
            "is_scanned": is_scanned,
            "cleaned_text": cleaned_text,
            "document_type": doc_type,
            "confidence": 0.85,
            "warnings": []
        }

    def _detect_if_scanned(self, text: str) -> bool:
        """
        Detect if document is scanned or digital.
        Simple heuristic: scanned docs have spelling errors, OCR artifacts.
        """
        ocr_artifacts = ["i|", "Il", "0O", "rn ", "m ", "vn"]
        count = sum(text.count(artifact) for artifact in ocr_artifacts)
        return count > 5

    def _clean_text(self, raw_text: str) -> str:
        """Clean extracted text."""
        # Remove extra whitespace
        text = " ".join(raw_text.split())
        # Remove common OCR artifacts
        text = text.replace("i|", "il").replace("0O", "00")
        return text.strip()

    def _detect_document_type(self, text: str, filename: str = "") -> str:
        """
        Detect document type using LLM.
        
        Types: income_certificate, caste_certificate, mark_sheet, id_proof, domicile, other
        """
        prompt = f"""
Analyze this document and determine its type.

Document Text:
{text[:500]}

Filename: {filename}

Possible types: income_certificate, caste_certificate, mark_sheet, id_proof, domicile_certificate, other

Return JSON:
{{
  "document_type": "...",
  "confidence": 0.95,
  "reason": "..."
}}
"""
        try:
            result = self.llm.call_json(
                system_prompt="You are a document analyst. Identify document types accurately.",
                user_prompt=prompt,
            )
            return result.get("document_type", "other")
        except Exception:
            return "other"
