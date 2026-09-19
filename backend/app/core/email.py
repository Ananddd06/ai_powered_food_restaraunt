import smtplib
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_password_reset_email(to_email: str, reset_token: str):
    """
    Sends a production password recovery email containing the secure reset link.
    Configured via settings:
    - SMTP_HOST (e.g., smtp.gmail.com, smtp.resend.com, smtp.sendgrid.net)
    - SMTP_PORT (e.g., 587 or 465)
    - SMTP_USER & SMTP_PASSWORD
    """
    reset_url = f"{settings.FRONTEND_URL}/forgot-password?token={reset_token}"

    message = MIMEMultipart("alternative")
    message["Subject"] = f"{settings.EMAILS_FROM_NAME} - Password Reset Request"
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["Reply-To"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = to_email


    text_content = f"""
Hello,

A password reset was requested for your GourmetAI account ({to_email}).

Please click or copy the following link to reset your password:
{reset_url}

This password recovery link will expire in 15 minutes.
If you did not request a password reset, please ignore this email.
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; margin: 0; padding: 30px 15px; }}
        .card {{ max-width: 520px; margin: 0 auto; background: #161e2e; border-radius: 20px; padding: 40px 32px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }}
        .brand {{ font-size: 24px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; margin-bottom: 24px; }}
        .title {{ font-size: 22px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }}
        .text {{ color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }}
        .btn-container {{ text-align: center; margin: 32px 0; }}
        .btn {{ display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3); }}
        .footer {{ font-size: 12px; color: #64748b; margin-top: 36px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="brand">GourmetAI</div>
        <div class="title">Reset Your Password</div>
        <p class="text">
            We received a request to reset the password for your account associated with <strong>{to_email}</strong>.
        </p>
        
        <div class="btn-container">
            <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
        </div>

        <p class="text" style="font-size: 13px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="{reset_url}" style="color: #34d399; word-break: break-all;">{reset_url}</a>
        </p>

        <div class="footer">
            This link is valid for 15 minutes.<br/>
            If you did not request a password reset, no action is required and your account remains secure.
        </div>
    </div>
</body>
</html>
"""

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            # Production SMTP with Authentication
            if settings.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    if settings.SMTP_TLS:
                        server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            print(f"[PRODUCTION SMTP] Sent password recovery email to {to_email} via {settings.SMTP_HOST}")
        else:
            # Direct or Local SMTP Server dispatch
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    try:
                        server.starttls()
                    except Exception:
                        pass
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            print(f"[SMTP DISPATCH] Sent email to {to_email}")
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")


def send_location_sharing_email(
    to_email: str,
    user_email: Optional[str],
    latitude: float,
    longitude: float,
    locality_name: str
):
    """
    Sends an email notification to the recipient address informing them that
    location permissions have been granted and live GPS position is being shared with GourmetAI.
    """
    from datetime import datetime
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    account_identifier = user_email if user_email else "Guest User"

    message = MIMEMultipart("alternative")
    message["Subject"] = f"📍 Location Access Notification - {settings.PROJECT_NAME}"
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = to_email

    text_content = f"""
Hello,

This is a location permission security notification from GourmetAI.

User Account: {account_identifier}
Status: Live GPS Location Access Granted
Target Locality: {locality_name}
GIS Coordinates: Latitude {latitude:.6f}, Longitude {longitude:.6f}
Timestamp: {timestamp_str}

Your live browser geolocation is currently being used for PostGIS spatial restaurant candidate selection and AI recommendation ranking.

If you did not authorize this, please revoke location access in your browser settings.
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 30px 15px; }}
        .card {{ max-width: 540px; margin: 0 auto; background: #111827; border-radius: 24px; padding: 40px 32px; border: 1px solid rgba(16, 185, 129, 0.2); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7); }}
        .badge {{ display: inline-block; background: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3); margin-bottom: 20px; }}
        .brand {{ font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 8px; }}
        .brand span {{ color: #10b981; }}
        .title {{ font-size: 20px; font-weight: 700; color: #f3f4f6; margin-bottom: 16px; }}
        .box {{ background: #1f2937; border-radius: 16px; padding: 20px; border: 1px solid #374151; margin: 24px 0; }}
        .row {{ display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }}
        .row:last-child {{ margin-bottom: 0; }}
        .label {{ color: #9ca3af; font-weight: 500; }}
        .val {{ color: #f9fafb; font-weight: 700; font-family: monospace; }}
        .text {{ color: #9ca3af; font-size: 14px; line-height: 1.6; }}
        .footer {{ font-size: 12px; color: #6b7280; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 20px; line-height: 1.5; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">📍 Live GPS Sharing Active</div>
        <div class="brand">Gourmet<span>AI</span></div>
        <div class="title">GPS Location Permission Authorized</div>
        
        <p class="text">
            You are receiving this notification because location permissions were enabled on your device for live restaurant discovery and GIS spatial mapping.
        </p>

        <div class="box">
            <div class="row">
                <span class="label">User Account:</span>
                <span class="val">{account_identifier}</span>
            </div>
            <div class="row">
                <span class="label">Locality:</span>
                <span class="val">{locality_name}</span>
            </div>
            <div class="row">
                <span class="label">Coordinates:</span>
                <span class="val">{latitude:.5f}, {longitude:.5f}</span>
            </div>
            <div class="row">
                <span class="label">Timestamp:</span>
                <span class="val">{timestamp_str}</span>
            </div>
        </div>

        <p class="text">
            This location is processed by our <strong>PostGIS & Live OpenStreetMap Discovery Engine</strong> to match top restaurants within your immediate radius.
        </p>

        <div class="footer">
            Sent securely by GourmetAI System Alerts.<br/>
            If you wish to stop sharing your position, disable Geolocation permissions in your browser.
        </div>
    </div>
</body>
</html>
"""

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)

    try:
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            if settings.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    if settings.SMTP_TLS:
                        server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            print(f"[PRODUCTION SMTP] Location permission notification email sent to {to_email}")
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    try:
                        server.starttls()
                    except Exception:
                        pass
                server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], message.as_string())
            print(f"[SMTP DISPATCH] Location permission notification email sent to {to_email}")
    except Exception as e:
        print(f"[SMTP ERROR] Failed to send location notification to {to_email}: {e}")

