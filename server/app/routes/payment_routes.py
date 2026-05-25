from fastapi import APIRouter, HTTPException
import razorpay
import os
from dotenv import load_dotenv
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
from app.database import (
    payments_collection,
    users_collection
)

load_dotenv()

router = APIRouter()

client = razorpay.Client(
    auth=(
        os.getenv("RAZORPAY_KEY_ID"),
        os.getenv("RAZORPAY_KEY_SECRET")
    )
)

# Create Order
@router.post("/create-order")
def create_order(data: dict):

    amount = data.get("amount")

    order = client.order.create({
        "amount": amount * 100,
        "currency": "INR",
        "payment_capture": 1
    })

    return {
        "order": order
    }

# Verify Payment
@router.post("/verify-payment")
def verify_payment(data: dict):

    razorpay_order_id = data.get(
        "razorpay_order_id"
    )

    razorpay_payment_id = data.get(
        "razorpay_payment_id"
    )

    razorpay_signature = data.get(
        "razorpay_signature"
    )

    user_email = data.get("email")

    plan_name = data.get("plan")

    try:

        client.utility.verify_payment_signature({
            "razorpay_order_id":
                razorpay_order_id,

            "razorpay_payment_id":
                razorpay_payment_id,

            "razorpay_signature":
                razorpay_signature
        })

        payment_data = {
            "email": user_email,
            "plan": plan_name,
            "payment_id": razorpay_payment_id,
            "order_id": razorpay_order_id,
            "status": "Success"
        }

        payments_collection.insert_one(
            payment_data
        )

        users_collection.update_one(
            {"email": user_email},
            {
                "$set": {
                    "subscriptionPlan": plan_name,
                    "subscriptionStatus": "Active"
                }
            }
        )

        return {
            "message": "Payment Verified"
        }

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Payment Verification Failed"
        )

# Get Billing History
@router.get("/billing-history/{email}")
def billing_history(email: str):

    payments = list(
        payments_collection.find(
            {"email": email},
            {"_id": 0}
        )
    )

    return {
        "payments": payments
    }
# Generate Invoice PDF
@router.get("/invoice/{payment_id}")
def generate_invoice(payment_id: str):

    payment = payments_collection.find_one({
        "payment_id": payment_id
    })

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    filename = f"invoice_{payment_id}.pdf"

    pdf = canvas.Canvas(filename)

    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(200, 800, "BillFlow Invoice")

    pdf.setFont("Helvetica", 14)

    pdf.drawString(
        100,
        740,
        f"Payment ID: {payment['payment_id']}"
    )

    pdf.drawString(
        100,
        710,
        f"Customer Email: {payment['email']}"
    )

    pdf.drawString(
        100,
        680,
        f"Subscription Plan: {payment['plan']}"
    )

    pdf.drawString(
        100,
        650,
        f"Payment Status: {payment['status']}"
    )

    pdf.drawString(
        100,
        620,
        "Thank you for choosing BillFlow!"
    )

    pdf.save()

    return FileResponse(
        filename,
        media_type='application/pdf',
        filename=filename
    )
# Admin Analytics
@router.get("/admin/analytics")
def admin_analytics():

    users = list(
        users_collection.find(
            {},
            {"_id": 0}
        )
    )

    payments = list(
        payments_collection.find(
            {},
            {"_id": 0}
        )
    )

    total_revenue = 0

    for payment in payments:

        if payment.get("plan") == "Pro":
            total_revenue += 499

        elif payment.get("plan") == "Enterprise":
            total_revenue += 1999

    active_subscriptions = len([
        user for user in users
        if user.get(
            "subscriptionStatus"
        ) == "Active"
    ])

    return {

        "total_users": len(users),

        "active_subscriptions":
            active_subscriptions,

        "total_revenue":
            total_revenue,

        "users": users,

        "payments": payments,
    }