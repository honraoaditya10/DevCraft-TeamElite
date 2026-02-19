"""New Agentic APIs - Document Upload, Eligibility Check, and Admin Routes."""

from datetime import datetime
import asyncio
from typing import Optional, List
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
import json
import base64
import os
import re
import httpx

from app.db.mongodb import get_db
from app.db.models import (
    DocumentUploadRequest,
    DocumentUploadResponse,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    UserDashboardResponse,
)
from app.agents.orchestrator import OrchestrationAgent

# Initialize router and agents
router = APIRouter(prefix="/api/v2", tags=["Agentic System"])
orchestrator = None  # Lazily initialized

def get_orchestrator():
    """Get or create orchestrator instance."""
    global orchestrator
    if orchestrator is None:
        orchestrator = OrchestrationAgent()
    return orchestrator


# ============================================================================
# STUDENT DOCUMENT UPLOAD ENDPOINTS
# ============================================================================

class DocumentUploadPayload(BaseModel):
    """Payload for document upload."""
    user_id: str
    document_text: str
    filename: Optional[str] = None


@router.post("/upload-document", response_model=dict)
async def upload_document(payload: DocumentUploadPayload) -> dict:
    """
    Upload and process a student document.

    Flow:
    1. Document Processing Agent detects type and cleans text
    2. Data Extraction Agent extracts structured fields
    3. Validation Agent checks data quality
    4. Store in MongoDB
    5. Trigger eligibility auto-recalculation

    Args:
        payload: Document upload request with user_id and document_text

    Returns:
        Upload status and document ID
    """
    success, message, document_id = get_orchestrator().process_student_document_upload(
        payload.user_id,
        payload.document_text,
        payload.filename or "document.pdf",
    )

    if success:
        return {
            "status": "success",
            "message": message,
            "document_id": document_id,
        }
    else:
        raise HTTPException(
            status_code=400,
            detail={"status": "error", "message": message},
        )


@router.post("/upload-profile-document", response_model=dict)
async def upload_profile_document(
    file: UploadFile = File(...),
    user_email: str = Form(...),
    doc_type: str = Form(default="income_certificate")
) -> dict:
    """
    Upload document image and extract profile data automatically.
    
    Uses Gemini Vision API to extract text from image,
    then extracts structured data specific to document type.

    Args:
        file: Image file (PNG, JPG, etc.)
        user_email: User email to update profile for
        doc_type: Type of document - 'income_certificate' or 'caste_certificate'

    Returns:
        Extracted data and update status
    """
    try:
        print(f"[DEBUG] Starting document upload for {user_email}, doc_type: {doc_type}")
        from app.agents.data_extractor import DataExtractionAgent
        
        # Read file
        file_content = await file.read()
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        print(f"[DEBUG] File read, size: {len(file_base64)} bytes")
        
        # Determine MIME type
        mime_type = file.content_type or 'image/jpeg'
        
        # Use Gemini's vision capability to extract text
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set")
            
        base_url = os.getenv("GEMINI_API_BASE", "https://generativelanguage.googleapis.com").rstrip("/")
        model = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        
        print(f"[DEBUG] Calling Gemini Vision API with model: {model}")
        
        url = f"{base_url}/v1beta/models/{model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": api_key,
        }
        
        # Set vision prompt based on document type
        if doc_type == "income_certificate":
            vision_prompt = """Extract all text from this Income Certificate document image.
Focus on extracting:
- Full Name / Name
- Annual Income (numeric value)
- Income Year
- Issued By / Authority
- Date of Issue

Return plain text, one field per line in 'field: value' format."""
        elif doc_type == "caste_certificate":
            vision_prompt = """Extract all text from this Caste Certificate document image.
Focus on extracting:
- Full Name / Name
- Category (SC/ST/OBC/General)
- Caste Name
- Community
- Issued By / Authority
- Date of Issue

Return plain text, one field per line in 'field: value' format."""
        else:
            vision_prompt = """Extract all text from this government document image.
Return plain text, one field per line in 'field: value' format."""
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": vision_prompt
                        },
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": file_base64
                            }
                        }
                    ]
                }
            ]
        }
        
        # Make API call with timeout and retry on 429
        print("[DEBUG] Making async request to Gemini API...")
        timeout = httpx.Timeout(90.0, connect=10.0, read=90.0, write=10.0)
        max_attempts = 3
        last_error = None
        async with httpx.AsyncClient(timeout=timeout) as client:
            for attempt in range(1, max_attempts + 1):
                try:
                    response = await client.post(url, json=payload, headers=headers)
                    if response.status_code == 429:
                        last_error = "Rate limit exceeded"
                        wait_seconds = 2 ** attempt
                        print(f"[WARN] Gemini 429 rate limit. Retry {attempt}/{max_attempts} in {wait_seconds}s")
                        await asyncio.sleep(wait_seconds)
                        continue
                    response.raise_for_status()
                    result = response.json()
                    break
                except httpx.TimeoutException:
                    print("[ERROR] Gemini API timeout")
                    raise HTTPException(status_code=504, detail="Vision API timeout - please try again")
                except Exception as e:
                    last_error = str(e)
                    print(f"[ERROR] Gemini API call failed: {e}")
                    if attempt == max_attempts:
                        raise HTTPException(status_code=500, detail=f"Vision API error: {last_error}")
            else:
                raise HTTPException(status_code=429, detail="Vision API rate limited - please retry in a moment")

        if "result" not in locals():
            raise HTTPException(status_code=429, detail="Vision API rate limited - please retry in a moment")
        
        # Extract text from response
        print("[DEBUG] Processing API response")
        try:
            extracted_text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if not extracted_text:
                raise ValueError("No text extracted from image")
            print(f"[DEBUG] Extracted text length: {len(extracted_text)}")
        except (KeyError, IndexError, TypeError) as e:
            print(f"[ERROR] Failed to parse API response: {e}")
            print(f"[ERROR] Response: {result}")
            raise HTTPException(status_code=500, detail="Failed to parse vision API response")
        
        # Now extract structured data using the extractor
        print(f"[DEBUG] Extracting structured data for doc_type: {doc_type}...")
        try:
            data_extractor = DataExtractionAgent()
            structured_data, confidence = data_extractor.extract_from_document(extracted_text, doc_type)
            print(f"[DEBUG] Structured data: {structured_data}, Confidence: {confidence}")
        except Exception as e:
            print(f"[ERROR] Data extraction failed: {e}")
            # Graceful fallback - still return what we extracted
            structured_data = {}
            confidence = 0.5

        # Heuristic fallback if LLM extraction fails or misses critical fields
        def _extract_income(text: str) -> Optional[str]:
            normalized = " ".join(text.split())
            patterns = [
                r"(?:annual income|income|family income|income amount)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([0-9][0-9,\.]+)",
                r"(?:rs\.?|inr|₹)\s*([0-9][0-9,\.]+)"
            ]
            for pattern in patterns:
                match = re.search(pattern, normalized, re.IGNORECASE)
                if match:
                    return match.group(1)
            return None

        def _extract_category(text: str) -> Optional[str]:
            upper = text.upper()
            if "SCHEDULED CASTE" in upper:
                return "SC"
            if "SCHEDULED TRIBE" in upper:
                return "ST"
            if "OTHER BACKWARD" in upper:
                return "OBC"
            match = re.search(r"\b(SC|ST|OBC|EWS|GENERAL|GEN)\b", upper)
            if match:
                value = match.group(1)
                return "GENERAL" if value == "GEN" else value
            return None

        if doc_type == "income_certificate":
            if not structured_data.get("annual_income"):
                fallback_income = _extract_income(extracted_text)
                if fallback_income:
                    structured_data["annual_income"] = fallback_income
                    print(f"[DEBUG] Fallback annual income: {fallback_income}")
        elif doc_type == "caste_certificate":
            if not structured_data.get("category"):
                fallback_category = _extract_category(extracted_text)
                if fallback_category:
                    structured_data["category"] = fallback_category
                    print(f"[DEBUG] Fallback category: {fallback_category}")
        
        # Map extracted data to user profile fields based on doc_type
        profile_update = {}
        
        if doc_type == "income_certificate":
            # For income certificate, extract annual income
            if structured_data.get("annual_income"):
                try:
                    income_str = str(structured_data["annual_income"]).replace(",", "").replace("₹", "").strip()
                    profile_update["annualIncome"] = int(float(income_str))
                    print(f"[DEBUG] Extracted annual income: {profile_update['annualIncome']}")
                except Exception as e:
                    print(f"[WARNING] Could not parse annual income: {e}")
            
            # Also extract name if present
            if structured_data.get("full_name"):
                profile_update["fullName"] = str(structured_data["full_name"]).strip()
        
        elif doc_type == "caste_certificate":
            # For caste certificate, extract category
            if structured_data.get("category"):
                profile_update["category"] = str(structured_data["category"]).strip()
                print(f"[DEBUG] Extracted category: {profile_update['category']}")
            
            # Also extract name if present
            if structured_data.get("full_name"):
                profile_update["fullName"] = str(structured_data["full_name"]).strip()
        
        # Update in MongoDB
        print(f"[DEBUG] Updating profile for {user_email}: {profile_update}")
        db = get_db()
        if db:
            try:
                db["users"].update_one(
                    {"email": user_email.lower()},
                    {"$set": profile_update}
                )
                print("[DEBUG] Profile updated successfully")
            except Exception as e:
                print(f"[ERROR] Failed to update profile: {e}")
        
        print("[DEBUG] Returning success response")
        return {
            "status": "success",
            "message": f"Document processed successfully (confidence: {confidence:.1%})",
            "extracted_data": structured_data,
            "profile_update": profile_update,
            "confidence": confidence
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=400,
            detail={
                "status": "error",
                "message": f"Failed to process document: {str(e)}"
            }
        )



@router.get("/documents/{user_id}")
async def list_user_documents(user_id: str) -> dict:
    """
    Get all documents uploaded by a user.

    Returns:
        List of document records
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        documents = list(db["documents"].find(
            {"user_id": user_id},
            {"raw_text": 0}  # Exclude raw text
        ).sort("uploaded_at", -1))

        # Convert ObjectId to string
        for doc in documents:
            doc["_id"] = str(doc["_id"])

        return {
            "status": "success",
            "count": len(documents),
            "documents": documents,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ELIGIBILITY CHECK ENDPOINTS
# ============================================================================

@router.post("/check-eligibility", response_model=dict)
async def check_eligibility(payload: EligibilityCheckRequest) -> dict:
    """
    Check eligibility for all available schemes.

    Flow:
    1. Extract complete student profile from all documents
    2. Load all schemes with rules
    3. Eligibility Decision Agent evaluates against each scheme
    4. Return categorized results

    Args:
        payload: User ID to check eligibility for

    Returns:
        Eligibility analysis with eligible/partial/not-eligible schemes
    """
    try:
        result = get_orchestrator().calculate_eligibility_for_user(payload.user_id)
        return {
            "status": "success",
            "data": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/eligibility/{user_id}")
async def get_eligibility_results(user_id: str) -> dict:
    """
    Get cached eligibility results for user.

    Returns:
        Stored eligibility analysis
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        # Get cached results
        results = list(db["eligibility_results"].find({"user_id": user_id}))

        # Convert ObjectId to string
        for result in results:
            result["_id"] = str(result["_id"])

        # Categorize
        eligible = [r for r in results if r.get("status") == "eligible"]
        partial = [r for r in results if r.get("status") == "partial"]
        not_eligible = [r for r in results if r.get("status") == "not_eligible"]

        return {
            "status": "success",
            "user_id": user_id,
            "eligible_count": len(eligible),
            "partial_count": len(partial),
            "not_eligible_count": len(not_eligible),
            "eligible_schemes": eligible,
            "partial_match_schemes": partial,
            "not_eligible_schemes": not_eligible,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# USER DASHBOARD ENDPOINTS
# ============================================================================

@router.get("/dashboard/{user_id}")
async def get_user_dashboard(user_id: str) -> dict:
    """
    Get complete dashboard data for user.

    Returns:
        User profile, documents, eligibility results, and next actions
    """
    try:
        data = get_orchestrator().get_user_dashboard_data(user_id)

        # Convert ObjectIds
        if data.get("user"):
            data["user"]["_id"] = str(data["user"]["_id"])

        for doc in data.get("documents", []):
            doc["_id"] = str(doc["_id"])

        for result in data.get("eligibility_results", []):
            result["_id"] = str(result["_id"])

        return {
            "status": "success",
            "dashboard": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str) -> dict:
    """
    Get extracted and merged user profile from all documents.

    Returns:
        Complete student profile with all extracted fields
    """
    try:
        profile = get_orchestrator().extract_and_merge_student_profile(user_id)

        return {
            "status": "success",
            "user_id": user_id,
            "profile": profile,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ADMIN ENDPOINTS - SCHEME MANAGEMENT
# ============================================================================

class SchemeUploadPayload(BaseModel):
    """Payload for scheme upload."""
    scheme_name: str
    scheme_text: str


@router.post("/admin/upload-scheme", response_model=dict)
async def upload_scheme(payload: SchemeUploadPayload) -> dict:
    """
    Admin endpoint: Upload and parse a government scheme.

    Flow:
    1. Scheme Understanding Agent extracts rules from document
    2. Convert policy text to rule structure
    3. Store in MongoDB
    4. Auto-recalculate eligibility for all users

    Args:
        payload: Scheme name and document text

    Returns:
        Upload status
    """
    success, message = get_orchestrator().load_scheme_from_document(
        payload.scheme_text,
        payload.scheme_name,
    )

    if success:
        return {
            "status": "success",
            "message": message,
        }
    else:
        raise HTTPException(status_code=400, detail=message)


@router.get("/admin/schemes")
async def list_schemes() -> dict:
    """
    Get all schemes in system.

    Returns:
        List of schemes with their rules
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        schemes = list(db["schemes"].find({}, {"_id": 1, "scheme_name": 1, "provider": 1, "description": 1}).sort("created_at", -1))

        for scheme in schemes:
            scheme["_id"] = str(scheme["_id"])

        return {
            "status": "success",
            "count": len(schemes),
            "schemes": schemes,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/scheme/{scheme_id}")
async def get_scheme_details(scheme_id: str) -> dict:
    """
    Get detailed scheme information including rules.
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        from bson import ObjectId
        scheme = db["schemes"].find_one({"_id": ObjectId(scheme_id)})
        
        if not scheme:
            raise HTTPException(status_code=404, detail="Scheme not found")

        scheme["_id"] = str(scheme["_id"])
        return {
            "status": "success",
            "scheme": scheme,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SYSTEM STATUS & ANALYTICS
# ============================================================================

@router.get("/analytics/summary")
async def get_analytics_summary() -> dict:
    """
    Get system analytics: users, documents, eligibility matches.

    Returns:
        System statistics
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        total_users = db["users"].count_documents({})
        total_documents = db["documents"].count_documents({})
        total_schemes = db["schemes"].count_documents({})
        eligible_matches = db["eligibility_results"].count_documents({"status": "eligible"})

        return {
            "status": "success",
            "analytics": {
                "total_users": total_users,
                "total_documents": total_documents,
                "total_schemes": total_schemes,
                "eligible_matches": eligible_matches,
                "timestamp": datetime.utcnow().isoformat(),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check() -> dict:
    """System health check endpoint."""
    try:
        db = get_db()
        db_status = "connected" if db is not None else "unavailable"
    except Exception:
        db_status = "unavailable"
    
    return {
        "status": "ok",
        "components": {
            "api": "running",
            "database": db_status,
            "agents": "ready",
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
