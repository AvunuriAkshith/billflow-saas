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

router = APIRouter()

# Register User
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

    users_collection.insert_one(new_user)

    return {
        "message": "User registered successfully"
    }

# Login User
@router.post("/login")
def login(user: LoginUser):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email"
        )

    is_password_correct = verify_password(
        user.password,
        existing_user["password"]
    )

    if not is_password_correct:
        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    token = create_access_token({
        "user_id": str(existing_user["_id"]),
        "email": existing_user["email"],
        "role": existing_user["role"]
    })

    return {
        "access_token": token,
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    }
85# Forgot Password
@router.post("/forgot-password")
def forgot_password(data: dict):

    email = data.get("email")

    new_password = data.get("new_password")

    existing_user = users_collection.find_one({
        "email": email
    })

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    hashed_password = hash_password(
        new_password
    )

    users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "password": hashed_password
            }
        }
    )

    return {
        "message":
            "Password updated successfully"
    }