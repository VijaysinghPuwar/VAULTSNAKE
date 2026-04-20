import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database import create_tables
from app.api import auth, vault, audit, alerts, admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger("vaultsnake")

settings = get_settings()

app = FastAPI(
    title="VAULTSNAKE API",
    description="Secure Vault & Access Monitoring Platform — Backend API",
    version="2.0.0",
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url="/redoc" if settings.app_env == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,   prefix="/api/auth")
app.include_router(vault.router,  prefix="/api/vault")
app.include_router(audit.router,  prefix="/api/audit")
app.include_router(alerts.router, prefix="/api/alerts")
app.include_router(admin.router,  prefix="/api/admin")


@app.on_event("startup")
def startup():
    create_tables()
    logger.info("VAULTSNAKE API started — tables ready")


@app.get("/health")
def health():
    return {"status": "ok", "service": "vaultsnake-api"}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s", request.url)
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})
