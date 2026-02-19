from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Any, List

from app.services.llm_service import LLMService


PROMPT_PATH = Path(__file__).resolve().parents[1] / "prompts" / "summary_prompt.txt"


def _load_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def synthesize_summary(student_profile: Dict[str, Any], evaluations: List[Dict[str, Any]]) -> Dict[str, Any]:
    llm = LLMService()
    prompt_template = _load_prompt()

    prompt = prompt_template
    prompt = prompt.replace("{{student_profile}}", json.dumps(student_profile, ensure_ascii=False))
    prompt = prompt.replace("{{evaluations}}", json.dumps(evaluations, ensure_ascii=False))

    summary = llm.call_json(
        system_prompt="You summarize eligibility decisions for a student.",
        user_prompt=prompt,
    )

    if not isinstance(summary, dict):
        raise ValueError("Summary response is not a JSON object.")

    return summary
