from datetime import datetime
from pymongo import ASCENDING, DESCENDING

from app.database import payments_collection


# Reuse the same MongoDB database already used by BillFlow payments.
# This avoids changing database.py just to add the notifications collection.
notifications_collection = payments_collection.database.get_collection(
    "notifications"
)


NOTIFICATION_TYPES = {
    "payment_success",
    "payment_failed",
    "invoice_generated",
    "subscription_activated",
    "subscription_cancelled",
    "subscription_expiring",
    "subscription_expired",
    "password_reset",
    "system"
}


def ensure_notification_indexes():
    """Create useful indexes safely. MongoDB ignores existing indexes."""
    try:
        notifications_collection.create_index(
            [("userEmail", ASCENDING), ("createdAt", DESCENDING)]
        )
        notifications_collection.create_index(
            [("userEmail", ASCENDING), ("read", ASCENDING)]
        )
    except Exception as exc:
        print("Notification index setup error:", exc)


def create_notification(
    user_email: str,
    notification_type: str,
    title: str,
    message: str,
    metadata: dict | None = None
):
    """Create a notification for a BillFlow user."""

    if not user_email:
        raise ValueError("user_email is required")

    if notification_type not in NOTIFICATION_TYPES:
        notification_type = "system"

    notification = {
        "userEmail": user_email,
        "type": notification_type,
        "title": title,
        "message": message,
        "read": False,
        "createdAt": datetime.utcnow(),
        "metadata": metadata or {}
    }

    result = notifications_collection.insert_one(notification)
    notification["_id"] = result.inserted_id

    return notification


def serialize_notification(notification: dict):
    return {
        "id": str(notification.get("_id")),
        "userEmail": notification.get("userEmail"),
        "type": notification.get("type", "system"),
        "title": notification.get("title", "Notification"),
        "message": notification.get("message", ""),
        "read": bool(notification.get("read", False)),
        "createdAt": notification.get("createdAt"),
        "metadata": notification.get("metadata", {})
    }


ensure_notification_indexes()
