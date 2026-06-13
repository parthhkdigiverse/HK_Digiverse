from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

from .schemas import ContactRequest
from .config import settings

app = FastAPI(title=settings.app_name)

# Parse CORS origins from settings
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routes ---

def send_email_task(name: str, email: str, service: str, message: str):
    if not settings.smtp_user or not settings.smtp_password:
        logging.warning("SMTP credentials not configured. Email not sent.")
        return
        
    msg = MIMEMultipart()
    msg['From'] = settings.smtp_user
    msg['To'] = settings.email_to
    msg['Subject'] = f"New Contact Request: {name} - {service}"
    msg['Reply-To'] = email
    
    body = f"Name: {name}\nEmail: {email}\nService: {service}\n\nMessage:\n{message}"
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        server = smtplib.SMTP(settings.smtp_server, settings.smtp_port)
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)
        server.quit()
        logging.info("Email sent successfully.")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")

@app.post("/api/contact")
async def contact_form(request: ContactRequest, background_tasks: BackgroundTasks):
    logging.info(f"Received contact request from {request.name} ({request.email})")
    
    # Run the email sending process in the background
    background_tasks.add_task(
        send_email_task, 
        request.name, 
        request.email, 
        request.service, 
        request.message
    )
    
    return {"status": "success", "message": "Your message has been received. We will get back to you shortly!"}

# --- Static File Serving ---

# Ensure we serve the frontend from the root directory
# Assuming the structure is:
# /HK DigiVerse/
#   index.html
#   css/
#   js/
#   backend/
#     main.py

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Mount static directories from within the frontend folder
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
# Assets if they exist in the frontend folder
if os.path.exists(os.path.join(FRONTEND_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")), name="assets")

@app.get("/")
async def read_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# Catch-all for any other static files in the frontend directory
@app.get("/{path:path}")
async def catch_all(path: str):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
