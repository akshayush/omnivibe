import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from backend.main import ContactRequest, send_enquiry_email


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


if __name__ == "__main__":
    unittest.main()
