"""Full founder-admission API flow against the isolated CI MongoDB service.

Never point this suite at production. The database name must begin with
bsquare_ci_, and its users/OTP collections are deliberately modified here.
"""
import asyncio
import os
from urllib.parse import parse_qs, urlparse

import pytest
from httpx import ASGITransport, AsyncClient

pytestmark = pytest.mark.skipif(
    os.environ.get("BSQUARE_TEST_INTEGRATION") != "1",
    reason="Integration test requires isolated MongoDB and explicit opt-in",
)


def test_work_email_linkedin_and_admission_end_to_end(monkeypatch):
    mongo_uri = os.environ.get("MONGODB_URI", "")
    assert "/bsquare_ci_" in mongo_uri, "Refusing to run against non-CI MongoDB"

    from app.api.v1 import linkedin_admission, signup_email
    from app.core.config import get_settings
    from app.core.security import create_access_token
    from app.db.connection import close_db, connect_db, get_db
    from app.main import app
    from app.models.user import new_user_document

    settings = get_settings()
    # This is an automated mocked provider response, not actual LinkedIn OAuth.
    monkeypatch.setattr(settings, "linkedin_client_id", "test-client")
    monkeypatch.setattr(settings, "linkedin_client_secret", "test-secret")
    monkeypatch.setattr(settings, "linkedin_redirect_uri", "https://test-api.example.com/api/v1/auth/linkedin/callback-v2")
    monkeypatch.setattr(settings, "linkedin_web_redirect_uri", "http://localhost:8081/linkedin-callback")

    captured = []

    async def fake_signup_mail(to_email, code):
        captured.append((to_email, code))
        return True

    async def fake_linkedin_claims(code):
        assert code == "test-code"
        return {
            "sub": "ci-linkedin-unique-sub",
            "email": "linkedin@company.example.com",
            "email_verified": True,
            "name": "Linked In Founder",
            "picture": "https://example.com/photo.png",
        }

    monkeypatch.setattr(signup_email, "send_signup_code_email", fake_signup_mail)
    monkeypatch.setattr(linkedin_admission.linkedin_oauth, "exchange_code_for_claims", fake_linkedin_claims)

    async def run():
        await connect_db()
        try:
            db = get_db()
            assert db.name.startswith("bsquare_ci_")
            async with AsyncClient(
                transport=ASGITransport(app=app),
                base_url="http://testserver",
                follow_redirects=False,
            ) as client:
                # Work-mail account registration
                email = "founder@startup.example.com"
                r = await client.post("/api/v1/auth/signup-email/request", json={"email": email})
                assert r.status_code == 200, r.text
                assert len(captured) == 1
                assert captured[0][0] == email
                code = captured[0][1]
                assert len(code) == 6
                r = await client.post("/api/v1/auth/signup-email/verify", json={"email": email, "code": code})
                assert r.status_code == 200, r.text
                ticket = r.json()["verificationToken"]
                r = await client.post("/api/v1/auth/signup-email/verify", json={"email": email, "code": code})
                assert r.status_code == 401, "Email OTP must be single-use"

                details = {
                    "name": "Founder Example",
                    "businessName": "Example Industries",
                    "email": email,
                    "password": "safe-test-password-2026",
                    "city": "Hyderabad",
                    "roleTitle": "Founder & CEO",
                    "verificationType": "work_email",
                    "verificationToken": ticket,
                }
                r = await client.post("/api/v1/auth/register-verified", json=details)
                assert r.status_code == 200, r.text
                assert r.json()["status"] == "pending"
                assert "accessToken" not in r.json(), "New applicants must not receive network tokens"
                r = await client.post("/api/v1/auth/register-verified", json=details)
                assert r.status_code == 401, "Signup ticket must be single-use"
                r = await client.post("/api/v1/auth/login", json={"email": email, "password": details["password"]})
                assert r.status_code == 403, "Pending applicant must not sign in"
                stored = await db.users.find_one({"email": email})
                assert stored["membershipStatus"] == "pending"

                # A second application can use LinkedIn OIDC, but neither LinkedIn
                # sign-in nor a self-declared role proves founder eligibility.
                r = await client.get("/api/v1/auth/linkedin/start", params={"platform": "web"})
                assert r.status_code == 200, r.text
                state = parse_qs(urlparse(r.json()["url"]).query)["state"][0]
                callback = await client.get(
                    "/api/v1/auth/linkedin/callback-v2",
                    params={"state": state, "code": "test-code"},
                )
                assert callback.status_code == 302, callback.text
                callback_ticket = parse_qs(urlparse(callback.headers["location"]).query)["ticket"][0]
                r = await client.get(
                    "/api/v1/auth/linkedin/callback-v2",
                    params={"state": state, "code": "test-code"},
                )
                assert r.status_code == 401, "OAuth state must not be replayable"
                r = await client.post("/api/v1/auth/linkedin/complete", json={"ticket": callback_ticket})
                assert r.status_code == 200, r.text
                assert r.json()["status"] == "profile_required"
                r = await client.post("/api/v1/auth/linkedin/apply", json={
                    "ticket": callback_ticket, "businessName": "Wrong Role Ltd",
                    "roleTitle": "Software Engineer", "city": "Hyderabad",
                })
                assert r.status_code == 422, "Non-founder roles must be rejected"
                r = await client.post("/api/v1/auth/linkedin/apply", json={
                    "ticket": callback_ticket, "businessName": "Linked Business Ltd",
                    "roleTitle": "Co-founder", "city": "Hyderabad",
                })
                assert r.status_code == 200, r.text
                assert r.json()["status"] == "pending"
                assert "accessToken" not in r.json()
                linkedin_user = await db.users.find_one({"email": "linkedin@company.example.com"})
                assert linkedin_user["membershipStatus"] == "pending"
                assert linkedin_user["oauthLinkedinSub"] == "ci-linkedin-unique-sub"
                r = await client.post("/api/v1/auth/linkedin/complete", json={"ticket": callback_ticket})
                assert r.status_code == 401, "OAuth admission ticket must be single-use"

                # LinkedIn sign-in for a pending account cannot bypass review.
                r = await client.get("/api/v1/auth/linkedin/start", params={"platform": "web"})
                state2 = parse_qs(urlparse(r.json()["url"]).query)["state"][0]
                callback2 = await client.get("/api/v1/auth/linkedin/callback-v2", params={"state": state2, "code": "test-code"})
                ticket2 = parse_qs(urlparse(callback2.headers["location"]).query)["ticket"][0]
                r = await client.post("/api/v1/auth/linkedin/complete", json={"ticket": ticket2})
                assert r.status_code == 403

                # Approved, allowlisted admin can review and record evidence.
                admin_email = settings.bsquare_admin_emails.split(",")[0].strip()
                assert admin_email
                admin_doc = new_user_document(
                    firstName="System", lastName="Admin", email=admin_email,
                    membershipStatus="approved", verificationStatus="approved",
                )
                await db.users.insert_one(admin_doc)
                admin_token = create_access_token(str(admin_doc["_id"]))
                headers = {"Authorization": f"Bearer {admin_token}"}
                r = await client.get("/api/v1/admin/admission/pending", headers=headers)
                assert r.status_code == 200
                assert len(r.json()["applications"]) == 2
                r = await client.post(
                    f"/api/v1/admin/admission/{stored['_id']}/approve",
                    headers=headers,
                    json={"evidenceNote": "Business registration and ownership independently reviewed"},
                )
                assert r.status_code == 200, r.text
                r = await client.post("/api/v1/auth/login", json={"email": email, "password": details["password"]})
                assert r.status_code == 200, r.text
                access = r.json()["accessToken"]
                r = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access}"})
                assert r.status_code == 200
                assert r.json()["membershipStatus"] == "approved"

                r = await client.post(
                    f"/api/v1/admin/admission/{linkedin_user['_id']}/reject",
                    headers=headers,
                    json={"evidenceNote": "Founder relationship could not be independently verified"},
                )
                assert r.status_code == 200, r.text
                r = await client.get("/api/v1/auth/linkedin/start", params={"platform": "web"})
                state3 = parse_qs(urlparse(r.json()["url"]).query)["state"][0]
                callback3 = await client.get("/api/v1/auth/linkedin/callback-v2", params={"state": state3, "code": "test-code"})
                ticket3 = parse_qs(urlparse(callback3.headers["location"]).query)["ticket"][0]
                r = await client.post("/api/v1/auth/linkedin/complete", json={"ticket": ticket3})
                assert r.status_code == 403, "Rejected LinkedIn applicant must remain blocked"
        finally:
            await close_db()

    asyncio.run(run())
