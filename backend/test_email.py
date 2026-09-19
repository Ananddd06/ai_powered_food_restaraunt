import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def test_send_email(to_email: str):
    print(f"\n--- Testing Gmail SMTP Email Dispatch ---")
    print(f"Target Recipient: {to_email}")
    print(f"SMTP Host: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
    print(f"SMTP User: {settings.SMTP_USER if settings.SMTP_USER else '(Not Set)'}")
    print(f"SMTP Password: {'[SET]' if settings.SMTP_PASSWORD else '(Not Set)'}\n")

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("❌ ERROR: SMTP_USER and SMTP_PASSWORD are not configured in backend/.env!")
        print("To send real emails to Gmail accounts, please create backend/.env with your Gmail & App Password:\n")
        print("  SMTP_HOST=smtp.gmail.com")
        print("  SMTP_PORT=587")
        print("  SMTP_USER=your_email@gmail.com")
        print("  SMTP_PASSWORD=your_16_char_app_password")
        print("  EMAILS_FROM_EMAIL=your_email@gmail.com\n")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = "GourmetAI - Real Email Test"
    message["From"] = f"GourmetAI <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = to_email

    html = f"""
    <div style="font-family: sans-serif; padding: 20px; background: #0b0f19; color: #fff; border-radius: 10px;">
        <h2 style="color: #10b981;">GourmetAI Email Dispatch Test</h2>
        <p>This is a real test email sent directly from your GourmetAI backend to <strong>{to_email}</strong>!</p>
        <p>Your Gmail SMTP integration is working perfectly.</p>
    </div>
    """
    message.attach(MIMEText(html, "html"))

    try:
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
        print(f"✅ SUCCESS: Email sent successfully to {to_email}! Check your Gmail inbox (and Spam folder).")
        return True
    except Exception as e:
        print(f"❌ SMTP DISPATCH ERROR: {e}")
        return False

if __name__ == "__main__":
    recipient = sys.argv[1] if len(sys.argv) > 1 else "anand06.jeyakumar@gmail.com"
    test_send_email(recipient)
