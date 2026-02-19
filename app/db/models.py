"""Pydantic models for MongoDB collections."""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from enum import Enum


class DocumentTypeEnum(str, Enum):
    INCOME_CERTIFICATE = "income_certificate"
    CAST_CERTIFICATE = "caste_certificate"
    MARK_SHEET = "mark_sheet"
    ID_PROOF = "id_proof"
    DOMICILE_CERTIFICATE = "domicile_certificate"
    OTHER = "other"


class DocumentStatusEnum(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EligibilityStatusEnum(str, Enum):
    ELIGIBLE = "eligible"
    NOT_ELIGIBLE = "not_eligible"
    PARTIAL = "partial"
    INSUFFICIENT_DATA = "insufficient_data"


class RuleOperatorEnum(str, Enum):
    EQUALS = "="
    NOT_EQUALS = "!="
    LESS_THAN = "<"
    LESS_THAN_EQUAL = "<="
    GREATER_THAN = ">"
    GREATER_THAN_EQUAL = ">="
    IN = "in"
    NOT_IN = "not_in"
    CONTAINS = "contains"


# Database Models
class UserProfile(BaseModel):
    """User profile in database."""

    full_name: str
    email: str
    phone: Optional[str] = None
    gender: Optional[str] = None
    category: Optional[str] = None
    annual_income: Optional[float] = None
    domicile_state: Optional[str] = None
    study_state: Optional[str] = None
    marks_percentage: Optional[float] = None
    disability_status: Optional[str] = None
    religion: Optional[str] = None
    course_level: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ExtractedDocumentData(BaseModel):
    """Extracted structured data from document."""

    full_name: Optional[str] = None
    income: Optional[float] = None
    category: Optional[str] = None
    issued_date: Optional[datetime] = None
    valid_till: Optional[datetime] = None
    authority: Optional[str] = None
    confidence: float = Field(default=0.0, ge=0.0, le=100.0)
    raw_text: Optional[str] = None


class DocumentRecord(BaseModel):
    """Document record in database."""

    user_id: str
    document_type: DocumentTypeEnum
    original_filename: str
    file_url: Optional[str] = None
    extracted_data: Optional[ExtractedDocumentData] = None
    raw_text: Optional[str] = None
    status: DocumentStatusEnum = DocumentStatusEnum.PENDING
    error_message: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    extraction_confidence: float = Field(default=0.0, ge=0.0, le=100.0)


class SchemeRule(BaseModel):
    """Single rule in a scheme."""

    field: str
    operator: RuleOperatorEnum
    value: Any
    description: Optional[str] = None


class SchemeRecord(BaseModel):
    """Scheme record in database."""

    scheme_name: str
    provider: str
    description: Optional[str] = None
    rules: List[SchemeRule]
    deadline: Optional[datetime] = None
    required_documents: Optional[List[DocumentTypeEnum]] = None
    benefits: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RuleMatchResult(BaseModel):
    """Result of matching a single rule."""

    field: str
    expected_value: Any
    actual_value: Any
    operator: RuleOperatorEnum
    matched: bool
    reason: str


class EligibilityResult(BaseModel):
    """Eligibility result for a user-scheme combination."""

    user_id: str
    scheme_id: str
    scheme_name: str
    status: EligibilityStatusEnum
    match_score: float = Field(default=0.0, ge=0.0, le=100.0)
    reason: str
    rule_details: Optional[List[RuleMatchResult]] = None
    missing_requirements: Optional[List[str]] = None
    recalculated_at: datetime = Field(default_factory=datetime.utcnow)


class ProcessingQueueItem(BaseModel):
    """Item in processing queue."""

    document_id: str
    task_type: str  # "extraction", "validation", "eligibility_check"
    status: str = "pending"  # pending, processing, completed, failed
    priority: int = Field(default=0, ge=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    retry_count: int = Field(default=0, ge=0)


# API Request/Response Models
class DocumentUploadRequest(BaseModel):
    """Request to upload document."""

    user_id: str
    document_type: DocumentTypeEnum
    document_text: str


class DocumentUploadResponse(BaseModel):
    """Response from document upload."""

    document_id: str
    status: DocumentStatusEnum
    message: str


class EligibilityCheckRequest(BaseModel):
    """Request to check eligibility."""

    user_id: str


class EligibilityCheckResponse(BaseModel):
    """Response from eligibility check."""

    eligible_schemes: List[Dict[str, Any]]
    partial_match_schemes: List[Dict[str, Any]]
    not_eligible_schemes: List[Dict[str, Any]]
    overall_score: float
    missing_requirements: List[str]
    next_actions: List[str]
    last_updated: datetime


class UserDashboardResponse(BaseModel):
    """User dashboard data."""

    user_id: str
    profile: UserProfile
    documents: List[DocumentRecord]
    eligibility_results: List[EligibilityResult]
    overall_completion: float
