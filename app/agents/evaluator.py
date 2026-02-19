from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List

from app.services.llm_service import LLMService


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "scholarships.json"
PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "evaluation_prompt.txt"


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def retrieve_scholarships() -> List[Dict[str, Any]]:
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Scholarship data must be a list.")
    return data


def evaluate_scholarships(student_profile: Dict[str, Any], scholarships: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    llm = LLMService()
    prompt_template = _load_prompt()

    evaluations: List[Dict[str, Any]] = []
    for scholarship in scholarships:
        prompt = prompt_template
        prompt = prompt.replace("{{student_profile}}", json.dumps(student_profile, ensure_ascii=False))
        prompt = prompt.replace("{{scholarship}}", json.dumps(scholarship, ensure_ascii=False))

        decision = llm.call_json(
            system_prompt="You are a deterministic government eligibility officer.",
            user_prompt=prompt,
        )

        if not isinstance(decision, dict):
            raise ValueError("Evaluation response is not a JSON object.")

        evaluations.append(decision)

    return evaluations
