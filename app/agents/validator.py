"""Validation Agent - validates extracted data for consistency and expiry."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, Any, List, Tuple


class ValidationAgent:
    """
    Validation Agent.
    
    Responsibilities:
    - Check data consistency
    - Verify expiry dates
    - Cross-check with user profile
    - Flag anomalies
    """

    def validate_extracted_data(self, extracted_data: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
        """
        Validate extracted data for consistency and completeness.

        Args:
            extracted_data: Extracted student profile data

        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Check required fields
        required_fields = ["full_name", "gender", "category", "annual_income"]
        for field in required_fields:
            if not extracted_data.get(field):
                errors.append(f"Missing required field: {field}")

        # Validate income range
        income = extracted_data.get("annual_income")
        if income is not None:
            if income < 0:
                errors.append("Income cannot be negative")
            elif income > 10000000:
                warnings.append("Income seems unusually high, verify manually")

        # Validate percentage fields
        marks = extracted_data.get("marks_percentage")
        if marks is not None:
            if marks < 0 or marks > 100:
                errors.append("Marks percentage must be between 0 and 100")

        # Check date validity
        valid_till = extracted_data.get("valid_till")
        if valid_till:
            try:
                expiry = datetime.fromisoformat(str(valid_till))
                if expiry < datetime.now():
                    errors.append("Document has expired")
            except ValueError:
                warnings.append("Could not parse validity date")

        # Validate category values
        category = extracted_data.get("category", "").upper()
        valid_categories = ["GENERAL", "OBC", "SC", "ST", "MINORITY", "EWS"]
        if category and category not in valid_categories:
            warnings.append(f"Unknown category: {category}")

        return len(errors) == 0, errors, warnings

    def cross_check_profile(self, extracted_data: Dict[str, Any], user_profile: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Cross-check extracted data against user profile.

        Args:
            extracted_data: Newly extracted data
            user_profile: User's existing profile

        Returns:
            Tuple of (matches, discrepancies)
        """
        discrepancies = []

        # Check name match
        if user_profile.get("full_name") and extracted_data.get("full_name"):
            if user_profile["full_name"].lower() != extracted_data["full_name"].lower():
                discrepancies.append(f"Name mismatch: {user_profile['full_name']} vs {extracted_data['full_name']}")

        # Check DOB match if available
        user_dob = user_profile.get("date_of_birth")
        extract_dob = extracted_data.get("date_of_birth")
        if user_dob and extract_dob and user_dob != extract_dob:
            discrepancies.append("Date of birth mismatch")

        # Check income consistency
        user_income = user_profile.get("annual_income")
        extract_income = extracted_data.get("annual_income")
        if user_income and extract_income:
            diff_pct = abs(user_income - extract_income) / user_income * 100
            if diff_pct > 10:
                discrepancies.append(f"Income variance: {diff_pct:.1f}%")

        return len(discrepancies) == 0, discrepancies

    def check_document_expiry(self, doc_data: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if document is expired.

        Returns:
            Tuple of (is_valid, status_message)
        """
        valid_till = doc_data.get("valid_till")
        if not valid_till:
            return True, "No expiry date found"

        try:
            expiry = datetime.fromisoformat(str(valid_till))
            now = datetime.now()

            if expiry < now:
                days_expired = (now - expiry).days
                return False, f"Expired {days_expired} days ago"
            else:
                days_remaining = (expiry - now).days
                return True, f"Valid for {days_remaining} more days"
        except ValueError:
            return False, "Invalid date format"

    def flag_anomalies(self, extracted_data: Dict[str, Any]) -> List[str]:
        """
        Flag potential data quality issues or anomalies.

        Returns:
            List of flagged issues
        """
        flags = []

        # Flag very high marks
        marks = extracted_data.get("marks_percentage")
        if marks and marks >= 95:
            flags.append("Exceptionally high marks - verify manually")

        # Flag zero income
        income = extracted_data.get("annual_income")
        if income == 0:
            flags.append("Zero income claimed - verify with department")

        # Flag missing critical document date
        issue_date = extracted_data.get("issued_date")
        valid_till = extracted_data.get("valid_till")
        if not issue_date or not valid_till:
            flags.append("Missing certificate dates")

        # Flag mismatched extraction confidence
        confidence = extracted_data.get("confidence", 0)
        if confidence < 0.5:
            flags.append("Low extraction confidence - manual review recommended")

        return flags
