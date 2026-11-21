"""Founder eligibility pre-screening. This is not identity or employment proof.

A company mailbox is evidence of access to that domain only. A title is
self-declared until an independent reviewer has confirmed it.
"""
import re

_PERSONAL_DOMAINS = frozenset({
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in", "ymail.com",
    "hotmail.com", "hotmail.co.uk", "outlook.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com", "aol.com", "proton.me",
    "protonmail.com", "zoho.com", "rediffmail.com", "mail.com",
    "gmx.com", "yandex.com", "qq.com", "163.com", "mailinator.com",
    "guerrillamail.com", "tempmail.com", "10minutemail.com",
})

_FOUNDER_ROLE = re.compile(
    r"\b(?:co[\s-]?founder|founder|business owner|owner|proprietor|"
    r"managing director|partner(?:\s*&\s*founder)?)\b",
    re.IGNORECASE,
)


def is_work_email(email: str) -> bool:
    value = email.strip().lower()
    if value.count("@") != 1:
        return False
    local, domain = value.rsplit("@", 1)
    return bool(local and "." in domain and domain not in _PERSONAL_DOMAINS and not domain.endswith(".local"))


def is_eligible_role(title: str) -> bool:
    value = title.strip()
    if not 2 <= len(value) <= 150:
        return False
    # A role title remains an applicant's assertion, never automatic approval.
    return bool(_FOUNDER_ROLE.search(value))
