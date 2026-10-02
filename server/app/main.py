from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.payment_routes import router as payment_router
from app.routes.notification_routes import router as notification_router


# Create FastAPI application FIRST
app = FastAPI()


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)


# Payment routes
app.include_router(
    payment_router,
    prefix="/api/payment",
    tags=["Payment"]
)


# Notification routes
app.include_router(
    notification_router,
    prefix="/api/notifications",
    tags=["Notifications"]
)


# Home / health check
@app.get("/")
def home():
    return {
        "message": "BillFlow Backend Running"
    }