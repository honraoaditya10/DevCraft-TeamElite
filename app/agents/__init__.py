"""Agents package."""

from app.agents.document_processor import DocumentProcessingAgent
from app.agents.data_extractor import DataExtractionAgent
from app.agents.validator import ValidationAgent
from app.agents.scheme_analyzer import SchemeUnderstandingAgent
from app.agents.eligibility_decision import EligibilityDecisionAgent
from app.agents.orchestrator import OrchestrationAgent

__all__ = [
    "DocumentProcessingAgent",
    "DataExtractionAgent",
    "ValidationAgent",
    "SchemeUnderstandingAgent",
    "EligibilityDecisionAgent",
    "OrchestrationAgent",
]

# Legacy exports
from app.agents.extractor import extract_student_profile  # noqa
from app.agents.evaluator import retrieve_scholarships, evaluate_scholarships  # noqa
