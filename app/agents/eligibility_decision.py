"""Eligibility Decision Agent - runs rule-matching logic and outputs decisions."""

from __future__ import annotations

from typing import Dict, Any, List, Tuple, Union
from datetime import datetime


class EligibilityDecisionAgent:
    """
    Eligibility Decision Agent.
    
    Responsibilities:
    - Run rule-matching logic
    - Compare user profile with scheme rules
    - Output deterministic decisions
    - Compute match scores
    """

    def __init__(self):
        pass

    def evaluate_eligibility(
        self, user_profile: Dict[str, Any], scheme_rules: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate user eligibility for a scheme.

        Args:
            user_profile: User's extracted profile
            scheme_rules: Scheme's eligibility rules

        Returns:
            Eligibility result with score and reasoning
        """
        if not user_profile or not scheme_rules:
            return {
                "eligible": False,
                "status": "insufficient_data",
                "confidence_score": 0,
                "reason": "Missing user profile or scheme rules",
                "rule_details": [],
            }

        # Check each rule
        rule_results = []
        matched_count = 0

        for rule in scheme_rules:
            result = self._evaluate_rule(user_profile, rule)
            rule_results.append(result)
            if result["matched"]:
                matched_count += 1

        # Calculate match score (percentage of rules matched)
        total_rules = len(scheme_rules)
        match_percentage = (matched_count / total_rules * 100) if total_rules > 0 else 0

        # Determine eligibility status
        eligible = matched_count == total_rules
        status = "eligible" if eligible else "not_eligible"

        # Generate reasons
        reasons = self._generate_reasons(rule_results)
        missing_requirements = self._get_missing_requirements(rule_results)

        return {
            "eligible": eligible,
            "status": status,
            "confidence_score": int(match_percentage),
            "match_score": match_percentage,
            "reason": reasons["summary"],
            "detailed_reasons": reasons["detailed"],
            "rule_details": rule_results,
            "missing_requirements": missing_requirements,
            "matched_rules": matched_count,
            "total_rules": total_rules,
        }

    def _evaluate_rule(self, user_profile: Dict[str, Any], rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a single rule.

        Returns:
            Rule evaluation result
        """
        field = rule.get("field", "")
        operator = rule.get("operator", "=")
        expected_value = rule.get("value")
        description = rule.get("description", "")

        # Get actual value from user profile
        actual_value = user_profile.get(field)

        # Perform comparison
        matched = self._compare_values(actual_value, operator, expected_value)

        return {
            "field": field,
            "operator": operator,
            "expected_value": expected_value,
            "actual_value": actual_value,
            "matched": matched,
            "description": description,
            "reason": self._explain_match(field, actual_value, operator, expected_value, matched),
        }

    def _compare_values(self, actual: Any, operator: str, expected: Any) -> bool:
        """
        Compare actual value with expected value using operator.

        Returns:
            Whether the comparison passed
        """
        if actual is None:
            return False

        try:
            if operator == "=":
                return actual == expected
            elif operator == "!=":
                return actual != expected
            elif operator == "<":
                return float(actual) < float(expected)
            elif operator == "<=":
                return float(actual) <= float(expected)
            elif operator == ">":
                return float(actual) > float(expected)
            elif operator == ">=":
                return float(actual) >= float(expected)
            elif operator == "in":
                # For category checks, make case-insensitive
                if isinstance(expected, (list, tuple)):
                    if isinstance(actual, str):
                        return actual.upper() in [str(e).upper() for e in expected]
                    return actual in expected
                return False
            elif operator == "not_in":
                if isinstance(expected, (list, tuple)):
                    if isinstance(actual, str):
                        return actual.upper() not in [str(e).upper() for e in expected]
                    return actual not in expected
                return False
            elif operator == "contains":
                return str(expected) in str(actual)
            else:
                return False
        except (ValueError, TypeError):
            return False

    def _explain_match(
        self, field: str, actual: Any, operator: str, expected: Any, matched: bool
    ) -> str:
        """Generate human-readable explanation of rule match."""
        if actual is None:
            return f"{field} not provided (required to be {operator} {expected})"

        if operator == "=":
            return f"{field} is {actual} (expected: {expected})" if matched else f"{field} is {actual} (expected: {expected})"
        elif operator == "<":
            return f"{field} {actual} < {expected}" if matched else f"{field} {actual} >= {expected}"
        elif operator == "<=":
            return f"{field} {actual} <= {expected}" if matched else f"{field} {actual} > {expected}"
        elif operator == ">":
            return f"{field} {actual} > {expected}" if matched else f"{field} {actual} <= {expected}"
        elif operator == ">=":
            return f"{field} {actual} >= {expected}" if matched else f"{field} {actual} < {expected}"
        elif operator == "in":
            return f"{field} ({actual}) is one of {expected}" if matched else f"{field} ({actual}) is not in {expected}"
        elif operator == "not_in":
            return f"{field} ({actual}) is not in {expected}" if matched else f"{field} ({actual}) is in {expected}"
        else:
            return f"{field}: {actual} {operator} {expected}"

    def _generate_reasons(self, rule_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate overall and detailed reasons."""
        passed = [r for r in rule_results if r["matched"]]
        failed = [r for r in rule_results if not r["matched"]]

        if not failed:
            summary = f"✓ All {len(passed)} eligibility criteria met"
        else:
            summary = f"✗ Failed {len(failed)} out of {len(rule_results)} criteria"

        detailed = [r["reason"] for r in rule_results]

        return {
            "summary": summary,
            "detailed": detailed,
            "passed_count": len(passed),
            "failed_count": len(failed),
        }

    def _get_missing_requirements(self, rule_results: List[Dict[str, Any]]) -> List[str]:
        """Get list of missing requirements."""
        missing = []
        for result in rule_results:
            if not result["matched"]:
                missing.append(f"{result['field']}: {result['reason']}")
        return missing

    def batch_evaluate(
        self, user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Evaluate user against multiple schemes.

        Args:
            user_profile: User's profile
            schemes: List of schemes with their rules

        Returns:
            List of eligibility results
        """
        results = []
        for scheme in schemes:
            scheme_rules = scheme.get("rules", [])
            result = self.evaluate_eligibility(user_profile, scheme_rules)
            result["scheme_name"] = scheme.get("scheme_name", "Unknown")
            result["scheme_id"] = scheme.get("_id", "")
            results.append(result)

        return results
