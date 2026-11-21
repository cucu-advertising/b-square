#!/usr/bin/env python3
"""Read-only, secret-safe readiness check for the founder admission release.

Run from backend-mobile (under the Python virtualenv). No database data is
read or modified; no secret values are printed.
"""
import sys
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.config import get_settings  # noqa: E402


def main() -> int:
    s = get_settings()
    callback = urlparse(s.linkedin_redirect_uri)
    web_callback = urlparse(s.linkedin_web_redirect_uri)
    required_path = "/api/v1/auth/linkedin/callback-v2"
    conditions = {
        "LinkedIn Client ID configured": bool(s.linkedin_client_id.strip()),
        "LinkedIn Client Secret configured": bool(s.linkedin_client_secret.strip()),
        "LinkedIn HTTPS callback configured": (
            callback.scheme == "https" and bool(callback.netloc)
            and callback.path == required_path
            and not callback.query and not callback.fragment
        ),
        "Web callback configured": (
            bool(s.linkedin_web_redirect_uri)
            and web_callback.scheme in {"http", "https"}
            and bool(web_callback.netloc)
            and web_callback.path.endswith("/linkedin-callback")
        ),
        "Native deep link scheme matches app": s.linkedin_app_redirect_scheme == "bsquare",
        "Admin reviewer allowlist configured": bool(s.bsquare_admin_emails.strip()),
        "Email OTP delivery configured": bool(s.resend_api_key.strip()),
        "Mail sender configured": (
            "@" in s.resend_from_email
            and not s.resend_from_email.endswith("@resend.dev>")
        ),
        "Access JWT secret configured": len(s.jwt_secret) >= 32,
        "Refresh JWT secret configured": len(s.jwt_refresh_secret) >= 32,
    }
    print("Bsquare founder admission: server configuration readiness")
    print("This check does not connect to LinkedIn, Resend, or MongoDB.")
    for label, passed in conditions.items():
        print(f"{'PASS' if passed else 'NOT READY'} - {label}")
    count = sum(conditions.values())
    print(f"\n{count}/{len(conditions)} checks configured.")
    if count != len(conditions):
        print("Do not switch live authentication to this release.")
    return 0 if count == len(conditions) else 2


if __name__ == "__main__":
    raise SystemExit(main())
