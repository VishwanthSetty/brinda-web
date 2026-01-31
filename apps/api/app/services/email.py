import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

def send_contact_email(name: str, email: str, phone: str, subject: str, message: str) -> bool:
    """
    Sends a contact form email using SMTP.
    This function is synchronous and should be run in a background task.
    """
    settings = get_settings()

    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured. Email not sent.")
        return False

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_user
        msg['To'] = settings.contact_recipient_email
        msg['Subject'] = f"New Contact Request: {subject}"
        msg['Reply-To'] = email

        body = f"""
        You have received a new message from the contact form:
        
        Name: {name}
        Email: {email}
        Phone: {phone}
        Subject: {subject}
        
        Message:
        {message}
        """
        
        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            
        logger.info(f"Contact email sent successfully from {email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send contact email: {str(e)}")
        return False
