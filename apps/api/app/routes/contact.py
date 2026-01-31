from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.schemas.contact import ContactRequest, ContactResponse
from app.services.email import send_contact_email
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/submit", response_model=ContactResponse)
async def submit_contact_form(
    contact_data: ContactRequest,
    background_tasks: BackgroundTasks
):
    """
    Handle contact form submissions.
    Sends an email in the background to avoid blocking the request.
    """
    try:
        # Enqueue the email sending task
        background_tasks.add_task(
            send_contact_email,
            name=contact_data.name,
            email=contact_data.email,
            phone=contact_data.phone,
            subject=contact_data.subject,
            message=contact_data.message
        )
        
        return ContactResponse(
            success=True,
            message="Your message has been received. We will get back to you shortly."
        )
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing your request."
        )
