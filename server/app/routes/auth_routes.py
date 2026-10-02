import os
import secrets
import hashlib

from datetime import datetime, timedelta

from dotenv import load_dotenv

from app.utils.email_service import (
    send_password_reset_email
)

load_dotenv()
from fastapi import APIRouter, HTTPException
from app.models.user_model import (
    RegisterUser,
    LoginUser
)
from app.database import users_collection
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token
)

from datetime import datetime, timedelta


router = APIRouter()


# ============================================================
# REGISTER USER
# ============================================================

@router.post("/register")
def register(user: RegisterUser):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = hash_password(
        user.password
    )

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": "user"
    }

    users_collection.insert_one(
        new_user
    )

    return {
        "message": "User registered successfully"
    }


# ============================================================
# LOGIN USER
# ============================================================

@router.post("/login")
def login(user: LoginUser):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid Email"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid Password"
        )

    access_token = create_access_token({
        "sub": existing_user["email"]
    })

    return {

        "access_token": access_token,

        "user": {

            "name":
                existing_user["name"],

            "email":
                existing_user["email"],

            "role":
                existing_user["role"],

            "subscriptionStatus":
                existing_user.get(
                    "subscriptionStatus",
                    "Inactive"
                ),

            "subscriptionPlan":
                existing_user.get(
                    "subscriptionPlan",
                    "Free"
                )
        }
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(data: dict):

    email = data.get("email")

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    existing_user = users_collection.find_one({
        "email": email
    })

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------------------------------
    # Generate secure random token
    # --------------------------------------------------------

    reset_token = secrets.token_urlsafe(32)

    # --------------------------------------------------------
    # Hash token before storing
    # --------------------------------------------------------

    token_hash = hashlib.sha256(
        reset_token.encode()
    ).hexdigest()

    # --------------------------------------------------------
    # Token expires after 15 minutes
    # --------------------------------------------------------

    reset_token_expiry = (
        datetime.utcnow()
        + timedelta(minutes=15)
    )

    # --------------------------------------------------------
    # Store token hash + expiry
    # --------------------------------------------------------

    users_collection.update_one(
        {
            "email": email
        },
        {
            "$set": {
                "resetToken": token_hash,
                "resetTokenExpiry":
                    reset_token_expiry
            }
        }
    )

    # --------------------------------------------------------
    # Create frontend reset URL
    # --------------------------------------------------------

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )

    reset_link = (
        f"{frontend_url}"
        f"/reset-password?token={reset_token}"
    )

    # --------------------------------------------------------
    # Send email
    # --------------------------------------------------------

    try:

        send_password_reset_email(
            recipient_email=email,
            reset_link=reset_link
        )

    except Exception as e:

        print(
            "Password reset email error:",
            e
        )

        # Remove token if email failed

        users_collection.update_one(
            {
                "email": email
            },
            {
                "$unset": {
                    "resetToken": "",
                    "resetTokenExpiry": ""
                }
            }
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send password reset email"
        )

    # --------------------------------------------------------
    # Production response
    # --------------------------------------------------------

    return {
        "message":
            "If an account exists with this email, "
            "a password reset link has been sent."
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(data: dict):

    token = data.get("token")
    new_password = data.get("new_password")

    if not token:

        raise HTTPException(
            status_code=400,
            detail="Reset token is required"
        )

    if not new_password:

        raise HTTPException(
            status_code=400,
            detail="New password is required"
        )

    # --------------------------------------------------------
    # Basic password validation
    # --------------------------------------------------------

    if len(new_password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    # --------------------------------------------------------
    # Hash incoming token
    # --------------------------------------------------------

    token_hash = hashlib.sha256(
        token.encode()
    ).hexdigest()

    # --------------------------------------------------------
    # Find user using token
    # --------------------------------------------------------

    user = users_collection.find_one({
        "resetToken": token_hash
    })

    if not user:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    # --------------------------------------------------------
    # Check token expiry
    # --------------------------------------------------------

    reset_token_expiry = user.get(
        "resetTokenExpiry"
    )

    if not reset_token_expiry:

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )

    if datetime.utcnow() >= reset_token_expiry:

        users_collection.update_one(
            {
                "_id": user["_id"]
            },
            {
                "$unset": {
                    "resetToken": "",
                    "resetTokenExpiry": ""
                }
            }
        )

        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )

    # --------------------------------------------------------
    # Hash new password
    # --------------------------------------------------------

    hashed_password = hash_password(
        new_password
    )

    # --------------------------------------------------------
    # Update password and invalidate token
    # --------------------------------------------------------

    users_collection.update_one(
        {
            "_id": user["_id"]
        },
        {
            "$set": {
                "password": hashed_password
            },
            "$unset": {
                "resetToken": "",
                "resetTokenExpiry": ""
            }
        }
    )

    return {
        "message": "Password reset successfully"
    }