from app.services.admission import is_eligible_role, is_work_email


def test_company_email_is_accepted():
    assert is_work_email("founder@mycompany.in")
    assert is_work_email("person@startup.co")


def test_personal_email_not_treated_as_business_verification():
    for email in ["founder@gmail.com", "ceo@outlook.com", "a@yahoo.co.in", "user@proton.me", "invalid"]:
        assert not is_work_email(email)


def test_founder_roles_can_apply_but_are_not_automatically_approved():
    for title in ["Founder", "Co-founder & CEO", "Managing Director", "Business Owner", "Proprietor"]:
        assert is_eligible_role(title)


def test_non_founder_roles_cannot_claim_founder_admission():
    for title in ["Intern", "Product Manager", "Software Engineer", "Marketing Executive", "Student", "CEO"]:
        assert not is_eligible_role(title)
