from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from .schemas import ContactRequest
from .config import settings

app = FastAPI(title=settings.app_name)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routes ---

@app.post("/api/contact")
async def contact_form(request: ContactRequest):
    # In a real app, you would send an email or save to a database
    print(f"Received contact request from {request.name} ({request.email})")
    print(f"Service interested: {request.service}")
    print(f"Message: {request.message}")
    
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
