import uvicorn
import socket
import multiprocessing
import subprocess
import os
from backend.config import settings

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def build_frontend():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(BASE_DIR, "frontend")
    
    package_json_root = os.path.join(BASE_DIR, "package.json")
    package_json_fe = os.path.join(frontend_path, "package.json")
    
    pkg_path = None
    work_dir = None
    
    if os.path.exists(package_json_fe):
        pkg_path = package_json_fe
        work_dir = frontend_path
    elif os.path.exists(package_json_root):
        pkg_path = package_json_root
        work_dir = BASE_DIR
        
    if pkg_path:
        print(f"📦 Found package.json at: {pkg_path}")
        node_modules = os.path.join(work_dir, "node_modules")
        
        if not os.path.exists(node_modules):
            print("🚀 node_modules folder is missing. Installing dependencies...")
            try:
                subprocess.run(["npm", "install"], cwd=work_dir, shell=True, check=True)
                print("✅ Dependencies installed successfully.")
            except Exception as e:
                print(f"❌ Error running npm install: {e}")
                return
        
        print("🔨 Building frontend assets...")
        try:
            subprocess.run(["npm", "run", "build"], cwd=work_dir, shell=True, check=True)
            print("✅ Frontend built successfully!")
        except Exception as e:
            print(f"❌ Error running npm run build: {e}")
    else:
        print("ℹ️ No frontend package.json found. Serving static files directly.")

def run_backend():
    print(f"Starting Backend on port {settings.backend_port}...")
    uvicorn.run(
        "backend.main:app", 
        host="0.0.0.0", 
        port=settings.backend_port, 
        reload=settings.debug
    )

def run_frontend():
    print(f"Starting Frontend on port {settings.frontend_port}...")
    # We can use uvicorn to serve the frontend folder as well
    from fastapi import FastAPI
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    fe_app = FastAPI()
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
    
    @fe_app.get("/env-config.js")
    def get_env_config():
        from fastapi.responses import Response
        content = f"window.API_BASE_URL = `${{window.location.protocol}}//${{window.location.hostname}}:{settings.backend_port}`;"
        return Response(content=content, media_type="application/javascript")
    
    fe_app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")
    
    uvicorn.run(fe_app, host="0.0.0.0", port=settings.frontend_port)

if __name__ == "__main__":
    build_frontend()
    local_ip = get_local_ip()
    
    print(f"\n🚀 {settings.app_name} Multi-Port Deployment")
    print(f"-------------------------------------------")
    print(f"Backend API (Network):  http://{local_ip}:{settings.backend_port}")
    print(f"Frontend UI (Network):  http://{local_ip}:{settings.frontend_port}")
    print(f"-------------------------------------------\n")

    # Start frontend in background process
    p_frontend = multiprocessing.Process(target=run_frontend)
    p_frontend.start()
    
    try:
        # Run backend in the main process to avoid nested multiprocessing issues with reload=True on macOS
        run_backend()
    except KeyboardInterrupt:
        print("\nStopping services...")
    finally:
        if p_frontend.is_alive():
            p_frontend.terminate()
            p_frontend.join()
