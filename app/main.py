from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.agents.extractor import extract_student_profile
from app.agents.evaluator import retrieve_scholarships, evaluate_scholarships
from app.agents.synthesizer import synthesize_summary
from app.api.routes_v2 import router as v2_router
from app.db.mongodb import MongoDBConnector

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class DocumentInput(BaseModel):
    document_text: str = Field(..., min_length=1)


class AnalysisResponse(BaseModel):
    status: str
    student_profile: dict
    eligible_scholarships: list
    rejected_scholarships: list
    analysis_summary: str
    confidence_score: int


app = FastAPI(title="Docu-Agent: Scholarship Recommendation Engine")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB
try:
    mongo = MongoDBConnector()
    print("✓ MongoDB initialized")
except Exception as e:
    print(f"⚠ MongoDB initialization warning: {e}")

# Include v2 routers (new agentic system)
app.include_router(v2_router)


@app.post("/analyze-student", response_model=AnalysisResponse)
async def analyze_student(payload: DocumentInput) -> AnalysisResponse:
    student_profile, extraction_status = extract_student_profile(payload.document_text)

    if extraction_status == "insufficient_data":
        return AnalysisResponse(
            status="insufficient_data",
            student_profile=student_profile,
            eligible_scholarships=[],
            rejected_scholarships=[],
            analysis_summary="Insufficient data to make eligibility decisions.",
            confidence_score=0,
        )

    scholarships = retrieve_scholarships()
    evaluations = evaluate_scholarships(student_profile, scholarships)
    synthesis = synthesize_summary(student_profile, evaluations)

    eligible = [item for item in evaluations if item.get("eligible") is True]
    rejected = [item for item in evaluations if item.get("eligible") is False]

    decision_confidences = [item.get("confidence_score", 0) for item in evaluations]
    avg_confidence = int(round(sum(decision_confidences) / len(decision_confidences))) if decision_confidences else 0

    analysis_summary = synthesis.get("analysis_summary", "")
    next_steps = synthesis.get("next_steps", [])
    if next_steps:
        steps_text = " ".join([f"{idx + 1}) {step}" for idx, step in enumerate(next_steps)])
        analysis_summary = f"{analysis_summary} Next steps: {steps_text}".strip()

    return AnalysisResponse(
        status="ok",
        student_profile=student_profile,
        eligible_scholarships=eligible,
        rejected_scholarships=rejected,
        analysis_summary=analysis_summary,
        confidence_score=max(0, min(100, avg_confidence)),
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "title": "Docu-Agent: Agentic Eligibility Intelligence System",
        "version": "2.0",
        "docs": "/docs",
        "health": "/health",
        "status": "running",
    }

