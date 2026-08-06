import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from backend.main import ContactRequest, build_enquiry_body, send_enquiry_email
from backend.profiling import ProfileError, profile_csv


class FakeSMTP:
    sent_messages = []

    def __init__(self, host, port, timeout):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.started_tls = False

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return None

    def starttls(self):
        self.started_tls = True

    def login(self, username, password):
        self.username = username
        self.password = password

    def send_message(self, message):
        self.sent_messages.append((self, message))


class EnquiryEmailTests(unittest.TestCase):
    def setUp(self):
        FakeSMTP.sent_messages.clear()
        self.request = ContactRequest(
            name="Ada Lovelace",
            email="ada@example.com",
            message="I would like to learn more about the program.",
        )

    def test_sends_enquiry_with_required_subject_and_reply_to(self):
        environment = {
            "SMTP_HOST": "smtp.example.com",
            "SMTP_PORT": "587",
            "SMTP_USERNAME": "smtp-user",
            "SMTP_PASSWORD": "smtp-password",
            "SMTP_FROM": "noreply@example.com",
        }
        with patch.dict(os.environ, environment, clear=True), patch("backend.main.smtplib.SMTP", FakeSMTP):
            send_enquiry_email(self.request)

        client, message = FakeSMTP.sent_messages[0]
        self.assertTrue(client.started_tls)
        self.assertEqual(message["To"], "akshayush007@gmail.com")
        self.assertEqual(message["Reply-To"], "ada@example.com")
        self.assertTrue(message["Subject"].startswith("OMNIVIBE ENQUIRY"))

    def test_rejects_delivery_when_smtp_is_not_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            with self.assertRaises(HTTPException) as raised:
                send_enquiry_email(self.request)
        self.assertEqual(raised.exception.status_code, 503)

    def test_body_includes_qualifying_answers_when_present(self):
        request = ContactRequest(
            name="Ada Lovelace",
            email="ada@example.com",
            message="We need a pipeline that reconciles three payment providers.",
            projectType="Data pipelines",
            timeline="This quarter",
            budget="15-50k",
            stack="Postgres, dbt, Airflow",
        )
        body = build_enquiry_body(request)
        self.assertIn("Project type: Data pipelines", body)
        self.assertIn("Timeline: This quarter", body)
        self.assertIn("Budget: 15-50k", body)
        self.assertIn("Current stack: Postgres, dbt, Airflow", body)

    def test_body_omits_qualifying_answers_when_absent(self):
        body = build_enquiry_body(self.request)
        self.assertNotIn("Project type:", body)
        self.assertIn("Message:", body)


class DatasetProfilingTests(unittest.TestCase):
    def test_profiles_columns_types_and_quality(self):
        raw = (
            b"order_id,amount,status,ordered_on,note\n"
            b"1,10.5,paid,2026-01-01,first\n"
            b"2,12.0,paid,2026-01-02,\n"
            b"3,11.5,failed,2026-01-03,third\n"
            b"4,9000.0,paid,2026-01-04,fourth\n"
        )
        report = profile_csv(raw, filename="orders.csv")

        self.assertEqual(report["rowCount"], 4)
        self.assertEqual(report["columnCount"], 5)
        columns = {column["name"]: column for column in report["columns"]}

        self.assertEqual(columns["order_id"]["inferredType"], "integer")
        self.assertEqual(columns["amount"]["inferredType"], "number")
        self.assertEqual(columns["ordered_on"]["inferredType"], "date")
        self.assertEqual(columns["status"]["inferredType"], "text")

        self.assertEqual(columns["note"]["missing"], 1)
        self.assertGreater(columns["amount"]["stats"]["max"], 100)
        self.assertTrue(any("UNIQUE" in check for check in columns["order_id"]["suggestedChecks"]))
        self.assertIsInstance(report["qualityScore"], int)

    def test_flags_duplicate_rows(self):
        raw = b"a,b\n1,2\n1,2\n3,4\n"
        report = profile_csv(raw)
        self.assertEqual(report["duplicateRows"], 1)
        self.assertTrue(any("duplicate" in issue.lower() for issue in report["datasetIssues"]))

    def test_rejects_empty_and_headerless_uploads(self):
        with self.assertRaises(ProfileError):
            profile_csv(b"")
        with self.assertRaises(ProfileError):
            profile_csv(b"only_header\n")

    def test_rejects_oversized_upload(self):
        with self.assertRaises(ProfileError):
            profile_csv(b"a,b\n" + b"1,2\n" * 1_000_000)


if __name__ == "__main__":
    unittest.main()
