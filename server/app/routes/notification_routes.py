from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException

from app.utils.notification_service import (
    notifications_collection,
    serialize_notification,
)


router = APIRouter(
    tags=["Notifications"]
)


@router.get("/{email}")
def get_notifications(email: str, limit: int = 30):
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    limit = max(1, min(limit, 100))

    notifications = list(
        notifications_collection.find(
            {"userEmail": email},
            {"_id": 1, "userEmail": 1, "type": 1, "title": 1,
             "message": 1, "read": 1, "createdAt": 1, "metadata": 1}
        )
        .sort("createdAt", -1)
        .limit(limit)
    )

    unread_count = notifications_collection.count_documents({
        "userEmail": email,
        "read": False
    })

    return {
        "notifications": [
            serialize_notification(item)
            for item in notifications
        ],
        "unreadCount": unread_count
    }


@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str, data: dict):
    email = data.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    try:
        object_id = ObjectId(notification_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = notifications_collection.update_one(
        {
            "_id": object_id,
            "userEmail": email
        },
        {
            "$set": {
                "read": True
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification marked as read"
    }


@router.post("/{email}/read-all")
def mark_all_notifications_read(email: str):
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    result = notifications_collection.update_many(
        {
            "userEmail": email,
            "read": False
        },
        {
            "$set": {
                "read": True
            }
        }
    )

    return {
        "message": "All notifications marked as read",
        "updatedCount": result.modified_count
    }


@router.delete("/{notification_id}")
def delete_notification(notification_id: str, data: dict):
    email = data.get("email")

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    try:
        object_id = ObjectId(notification_id)
    except (InvalidId, TypeError):
        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = notifications_collection.delete_one({
        "_id": object_id,
        "userEmail": email
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification deleted"
    }
