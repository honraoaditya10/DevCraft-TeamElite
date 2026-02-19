from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple, Dict, Any, List

from app.services.llm_service import LLMService


PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "extraction_prompt.txt"


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def _missing_fields(profile: Dict[str, Any]) -> List[str]:
    required = [
        "full_name",
        "gender",
        "category",
        "annual_income",
        "domicile_state",
        "study_state",
        "marks_percentage",
        "disability_status",
        "religion",
        "course_level",
    ]
    missing = []
    for field in required:
        value = profile.get(field)
        if value is None:
            missing.append(field)
            continue
        if isinstance(value, str) and value.strip().lower() in {"", "unknown", "n/a", "na"}:
            missing.append(field)
    return missing


def extract_student_profile(document_text: str) -> Tuple[Dict[str, Any], str]:
    prompt_template = _load_prompt()
    prompt = prompt_template.replace("{{document_text}}", document_text.strip())

    llm = LLMService()
    response = llm.call_json(
        system_prompt="You extract structured student data for eligibility checks.",
        user_prompt=prompt,
    )

    if not isinstance(response, dict):
        raise ValueError("Extraction response is not a JSON object.")

    missing = _missing_fields(response)
    if missing:
        response["missing_fields"] = missing
        return response, "insufficient_data"

    return response, "ok"
