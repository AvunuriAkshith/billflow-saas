from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth_routes import router as auth_router
from app.routes.payment_routes import router as payment_router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://billflow-saas-re73aoy01-avunuri-akshith-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    payment_router,
    prefix="/api/payment",
    tags=["Payment"]
)

@app.get("/")
def home():
    return {
        "message": "BillFlow Backend Running"
    }