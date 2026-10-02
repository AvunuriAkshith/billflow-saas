
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime, timedelta
import razorpay
import os
import hmac
import hashlib

from app.database import (
    users_collection,
    payments_collection
)
from app.utils.email_service import (
    send_payment_success_email,
    send_payment_failed_email,
    send_subscription_cancelled_email,
    send_subscription_expired_email,
    send_invoice_email
)

from app.utils.notification_service import create_notification

from dotenv import load_dotenv

load_dotenv()

router = APIRouter(
    tags=["Payment"]
)


# ============================================================
# RAZORPAY CONFIGURATION
# ============================================================

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

client = razorpay.Client(
    auth=(
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET
    )
)


# ============================================================
# PLAN CONFIGURATION
# ============================================================

PLAN_PRICES = {
    "Free": 0,
    "Pro": 499,
    "Enterprise": 1999
}

PLAN_DURATION_DAYS = {
    "Pro": 30,
    "Enterprise": 30
}


# ============================================================
# REQUEST MODELS
# ============================================================

class PaymentRequest(BaseModel):
    amount: int
    currency: str = "INR"


# ============================================================
# CREATE RAZORPAY ORDER
# ============================================================

@router.post("/create-order")
def create_order(data: dict):

    amount = data.get("amount")

    if amount is None:
        raise HTTPException(
            status_code=400,
            detail="Amount is required"
        )

    try:
        amount = int(amount)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="Invalid amount"
        )

    if amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

    # Validate amount against available plans
    if amount not in PLAN_PRICES.values():
        raise HTTPException(
            status_code=400,
            detail="Invalid plan amount"
        )

    amount_in_paise = amount * 100

    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "payment_capture": 1
    }

    try:

        order = client.order.create(
            data=order_data
        )

        return {
            "id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"]
        }

    except Exception as e:

        print("Razorpay Order Error:", e)

        raise HTTPException(
            status_code=500,
            detail="Unable to create payment order"
        )

def create_invoice_pdf(payment, user):
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from io import BytesIO

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4
    )

    width, height = A4

    # --------------------------------------------------------
    # Payment Data
    # --------------------------------------------------------

    payment_id = payment.get(
        "payment_id",
        ""
    )

    order_id = payment.get(
        "order_id",
        ""
    )

    plan = payment.get(
        "plan",
        "Unknown"
    )

    amount = payment.get(
        "amount",
        0
    )

    currency = payment.get(
        "currency",
        "INR"
    )

    payment_date = payment.get(
        "payment_date"
    )

    subscription_start = payment.get(
        "subscription_start"
    )

    subscription_end = payment.get(
        "subscription_end"
    )

    status = payment.get(
        "status",
        "Success"
    )

    customer_name = (
        user.get("name")
        if user
        else "Customer"
    )

    customer_email = payment.get(
        "email",
        ""
    )

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    pdf.setFillColor(
        colors.HexColor("#2563eb")
    )

    pdf.rect(
        0,
        height - 100,
        width,
        100,
        fill=1,
        stroke=0
    )

    pdf.setFillColor(
        colors.white
    )

    pdf.setFont(
        "Helvetica-Bold",
        24
    )

    pdf.drawString(
        50,
        height - 55,
        "BillFlow"
    )

    pdf.setFont(
        "Helvetica",
        11
    )

    pdf.drawString(
        50,
        height - 75,
        "Subscription Billing Platform"
    )

    # --------------------------------------------------------
    # Invoice Title
    # --------------------------------------------------------

    pdf.setFillColor(
        colors.black
    )

    pdf.setFont(
        "Helvetica-Bold",
        22
    )

    pdf.drawRightString(
        width - 50,
        height - 145,
        "INVOICE"
    )

    # --------------------------------------------------------
    # Invoice Information
    # --------------------------------------------------------

    y = height - 185

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        50,
        y,
        "Payment ID:"
    )

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        135,
        y,
        str(payment_id)
    )

    y -= 20

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        50,
        y,
        "Order ID:"
    )

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        135,
        y,
        str(order_id)
    )

    y -= 20

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        50,
        y,
        "Payment Date:"
    )

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        135,
        y,
        str(payment_date)
    )

    # --------------------------------------------------------
    # Customer
    # --------------------------------------------------------

    y -= 45

    pdf.setFont(
        "Helvetica-Bold",
        12
    )

    pdf.drawString(
        50,
        y,
        "Bill To"
    )

    y -= 20

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        50,
        y,
        str(customer_name)
    )

    y -= 16

    pdf.drawString(
        50,
        y,
        str(customer_email)
    )

    # --------------------------------------------------------
    # Plan
    # --------------------------------------------------------

    y -= 45

    pdf.setFillColor(
        colors.HexColor("#f3f4f6")
    )

    pdf.rect(
        50,
        y - 8,
        width - 100,
        30,
        fill=1,
        stroke=0
    )

    pdf.setFillColor(
        colors.black
    )

    pdf.setFont(
        "Helvetica-Bold",
        10
    )

    pdf.drawString(
        60,
        y + 2,
        "Description"
    )

    pdf.drawRightString(
        width - 60,
        y + 2,
        "Amount"
    )

    y -= 35

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawString(
        60,
        y,
        f"{plan} Subscription"
    )

    pdf.drawRightString(
        width - 60,
        y,
        f"{currency} {amount}"
    )

    # --------------------------------------------------------
    # Billing Period
    # --------------------------------------------------------

    y -= 25

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.drawString(
        60,
        y,
        "Billing Period"
    )

    y -= 15

    pdf.drawString(
        60,
        y,
        f"{subscription_start}  to  {subscription_end}"
    )

    # --------------------------------------------------------
    # Total
    # --------------------------------------------------------

    y -= 40

    pdf.setLineWidth(
        1
    )

    pdf.line(
        50,
        y,
        width - 50,
        y
    )

    y -= 30

    pdf.setFont(
        "Helvetica-Bold",
        14
    )

    pdf.drawString(
        50,
        y,
        "Total"
    )

    pdf.drawRightString(
        width - 60,
        y,
        f"{currency} {amount}"
    )

    # --------------------------------------------------------
    # Status
    # --------------------------------------------------------

    y -= 35

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawString(
        50,
        y,
        "Payment Status:"
    )

    pdf.setFont(
        "Helvetica",
        11
    )

    pdf.drawString(
        160,
        y,
        str(status)
    )

    # --------------------------------------------------------
    # Footer
    # --------------------------------------------------------

    pdf.setFont(
        "Helvetica",
        9
    )

    pdf.setFillColor(
        colors.grey
    )

    pdf.drawCentredString(
        width / 2,
        45,
        "Thank you for choosing BillFlow."
    )

    pdf.drawCentredString(
        width / 2,
        30,
        "This is a computer-generated invoice."
    )

    pdf.save()

    buffer.seek(0)

    return buffer.getvalue()
# ============================================================
# VERIFY PAYMENT
# ============================================================

@router.post("/verify-payment")
def verify_payment(data: dict):

    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")

    user_email = data.get("email")
    plan_name = data.get("plan")

    if not razorpay_order_id:
        raise HTTPException(
            status_code=400,
            detail="Razorpay order ID is required"
        )

    if not razorpay_payment_id:
        raise HTTPException(
            status_code=400,
            detail="Razorpay payment ID is required"
        )

    if not razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Razorpay signature is required"
        )

    if not user_email:
        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    if not plan_name:
        raise HTTPException(
            status_code=400,
            detail="Plan is required"
        )

    if plan_name not in PLAN_PRICES:
        raise HTTPException(
            status_code=400,
            detail="Invalid subscription plan"
        )

    # --------------------------------------------------------
    # Verify Razorpay Signature
    # --------------------------------------------------------

    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(
        generated_signature,
        razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment verification failed"
        )

    # --------------------------------------------------------
    # Find User
    # --------------------------------------------------------

    user = users_collection.find_one(
        {
            "email": user_email
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------------------------------
    # Subscription Dates
    # --------------------------------------------------------

    subscription_start = datetime.utcnow()

    duration_days = PLAN_DURATION_DAYS.get(
        plan_name,
        30
    )

    subscription_end = (
        subscription_start +
        timedelta(days=duration_days)
    )

    # --------------------------------------------------------
    # Payment Amount
    # --------------------------------------------------------

    amount = PLAN_PRICES.get(
        plan_name,
        0
    )

    # --------------------------------------------------------
    # Payment Record
    # --------------------------------------------------------

    payment_data = {

        "email": user_email,

        "plan": plan_name,

        "amount": amount,

        "currency": "INR",

        "payment_id": razorpay_payment_id,

        "order_id": razorpay_order_id,

        "status": "Success",

        "payment_date": subscription_start,

        "subscription_start": subscription_start,

        "subscription_end": subscription_end
    }

    # --------------------------------------------------------
    # Store Payment
    # --------------------------------------------------------

    payments_collection.insert_one(
        payment_data
    )

    # --------------------------------------------------------
    # Update User Subscription
    # --------------------------------------------------------

    users_collection.update_one(
        {
            "email": user_email
        },
        {
            "$set": {
    "subscriptionPlan": plan_name,
    "subscriptionStatus": "Active",
    "subscriptionStart": subscription_start,
    "subscriptionEnd": subscription_end,
    "autoRenew": True,
    "cancelledAt": None,
    "expiryEmailSent": False
}
        }
    )
    # --------------------------------------------------------
    # SEND PAYMENT SUCCESS EMAIL
    # --------------------------------------------------------

    try:

        send_payment_success_email(
            recipient_email=user_email,
            customer_name=user.get(
                "name",
                "Customer"
            ),
            plan_name=plan_name,
            amount=amount,
            payment_id=razorpay_payment_id,
            subscription_start=subscription_start,
            subscription_end=subscription_end
        )

        print(
            "Payment success email sent to:",
            user_email
        )

    except Exception as e:

        print(
            "Payment success email error:",
            e
        )
    # --------------------------------------------------------
    # SEND INVOICE EMAIL
    # --------------------------------------------------------

    try:

        invoice_payment = {
            **payment_data
        }

        invoice_pdf = create_invoice_pdf(
            invoice_payment,
            user
        )

        send_invoice_email(
            recipient_email=user_email,
            customer_name=user.get(
                "name",
                "Customer"
            ),
            plan_name=plan_name,
            amount=amount,
            payment_id=razorpay_payment_id,
            subscription_start=subscription_start,
            subscription_end=subscription_end,
            pdf_bytes=invoice_pdf
        )

        print(
            "Invoice email sent to:",
            user_email
        )

    except Exception as e:

        print(
            "Invoice email error:",
            e
        )

    # --------------------------------------------------------
    # CREATE IN-APP NOTIFICATIONS
    # --------------------------------------------------------

    try:
        create_notification(
            user_email=user_email,
            notification_type="payment_success",
            title="Payment Successful",
            message=f"Your {plan_name} subscription payment of ₹{amount} was successful.",
            metadata={
                "plan": plan_name,
                "amount": amount,
                "paymentId": razorpay_payment_id
            }
        )

        create_notification(
            user_email=user_email,
            notification_type="invoice_generated",
            title="Invoice Generated",
            message="Your BillFlow invoice is ready and has been sent to your email.",
            metadata={
                "paymentId": razorpay_payment_id
            }
        )

    except Exception as e:
        print(
            "Notification creation error:",
            e
        )

    return {

        "message": "Payment verified successfully",

        "subscriptionPlan": plan_name,

        "subscriptionStatus": "Active",

        "subscriptionStart": subscription_start,

        "subscriptionEnd": subscription_end,

        "autoRenew": True
    }


# ============================================================
# RAZORPAY WEBHOOK
# ============================================================


def _razorpay_timestamp_to_datetime(timestamp):
    """Convert a Razorpay Unix timestamp to a UTC datetime."""

    try:
        return datetime.utcfromtimestamp(int(timestamp))
    except (TypeError, ValueError, OverflowError):
        return datetime.utcnow()


def _find_user_for_subscription(subscription_entity, payment_entity=None):
    """Find a BillFlow user using Razorpay subscription id or email."""

    subscription_id = subscription_entity.get("id")

    if subscription_id:
        user = users_collection.find_one(
            {
                "razorpaySubscriptionId": subscription_id
            }
        )

        if user:
            return user

    payment_entity = payment_entity or {}
    payment_email = payment_entity.get("email")

    if payment_email:
        user = users_collection.find_one(
            {
                "email": payment_email
            }
        )

        if user:
            return user

    return None


@router.post("/webhook")
async def razorpay_webhook(request: Request):
    """
    Receive and securely process Razorpay webhook events.

    Razorpay signs the raw request body using the webhook secret.
    The signature must be verified before any event is trusted.
    """

    if not RAZORPAY_WEBHOOK_SECRET:
        print("Razorpay webhook error: RAZORPAY_WEBHOOK_SECRET is not configured")
        raise HTTPException(
            status_code=500,
            detail="Webhook secret is not configured"
        )

    raw_body = await request.body()

    if not raw_body:
        raise HTTPException(
            status_code=400,
            detail="Empty webhook body"
        )

    razorpay_signature = request.headers.get(
        "x-razorpay-signature"
    )

    if not razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Razorpay webhook signature is required"
        )

    generated_signature = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(
        generated_signature,
        razorpay_signature
    ):
        print("Razorpay webhook error: invalid signature")
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook signature"
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid webhook JSON"
        )

    event_name = payload.get("event", "unknown")

    # Hash the exact raw payload so an identical webhook retry is
    # processed only once after successful completion.
    event_hash = hashlib.sha256(raw_body).hexdigest()

    webhook_events_collection = payments_collection.database[
        "webhook_events"
    ]

    existing_event = webhook_events_collection.find_one(
        {
            "event_hash": event_hash,
            "processed": True
        }
    )

    if existing_event:
        print(
            "Razorpay webhook already processed:",
            event_name
        )

        return {
            "status": "ok",
            "message": "Webhook already processed"
        }

    # Create/update a lightweight audit record. We deliberately do not
    # store the complete raw webhook payload because payment payloads
    # can contain customer/payment metadata that does not need to be
    # retained in the webhook audit collection.
    webhook_events_collection.update_one(
        {
            "event_hash": event_hash
        },
        {
            "$set": {
                "event": event_name,
                "received_at": datetime.utcnow(),
                "processed": False
            }
        },
        upsert=True
    )

    try:
        payload_data = payload.get("payload", {})

        # --------------------------------------------------------
        # PAYMENT EVENTS
        # --------------------------------------------------------

        if event_name in {
            "payment.captured",
            "payment.authorized",
            "payment.failed",
            "order.paid"
        }:
            payment_wrapper = payload_data.get(
                "payment",
                {}
            )

            payment_entity = payment_wrapper.get(
                "entity",
                {}
            )

            payment_id = payment_entity.get("id")
            order_id = payment_entity.get("order_id")

            if payment_id:
                payment_update = {
                    "webhookEvent": event_name,
                    "webhookProcessedAt": datetime.utcnow()
                }

                if event_name == "payment.captured":
                    payment_update["gatewayStatus"] = "captured"

                elif event_name == "payment.authorized":
                    payment_update["gatewayStatus"] = "authorized"

                elif event_name == "payment.failed":
                    payment_update["gatewayStatus"] = "failed"

                    error_details = payment_entity.get(
                        "error_description"
                    ) or payment_entity.get(
                        "error_reason"
                    ) or payment_entity.get(
                        "error_code"
                    ) or "Payment failed"

                    payment_update["failureReason"] = error_details
                    payment_update["failedAt"] = datetime.utcnow()

                elif event_name == "order.paid":
                    payment_update["gatewayStatus"] = "paid"

                existing_payment = None

                if payment_id:
                    existing_payment = payments_collection.find_one(
                        {
                            "payment_id": payment_id
                        }
                    )

                    payments_collection.update_one(
                        {
                            "payment_id": payment_id
                        },
                        {
                            "$set": payment_update
                        }
                    )

                # ----------------------------------------------------
                # PAYMENT FAILURE NOTIFICATION
                # ----------------------------------------------------

                if event_name == "payment.failed":
                    payment_email = payment_entity.get("email")
                    user = None

                    if payment_email:
                        user = users_collection.find_one(
                            {
                                "email": payment_email
                            }
                        )

                    if not user and existing_payment:
                        existing_email = existing_payment.get("email")
                        if existing_email:
                            user = users_collection.find_one(
                                {
                                    "email": existing_email
                                }
                            )

                    if user:
                        failure_reason = (
                            payment_entity.get("error_description")
                            or payment_entity.get("error_reason")
                            or payment_entity.get("error_code")
                            or "Payment could not be completed"
                        )

                        amount_rupees = round(
                            float(payment_entity.get("amount", 0)) / 100,
                            2
                        )

                        # Mark the user's latest payment attempt as failed.
                        # Do not change an already-active subscription here;
                        # a failed new purchase should not remove existing access.
                        users_collection.update_one(
                            {
                                "email": user.get("email")
                            },
                            {
                                "$set": {
                                    "lastPaymentStatus": "Failed",
                                    "lastPaymentFailureReason": failure_reason,
                                    "lastPaymentFailedAt": datetime.utcnow()
                                }
                            }
                        )

                        # Avoid sending the same failure notification more than once.
                        failure_email_sent = bool(
                            existing_payment and
                            existing_payment.get("failureEmailSent", False)
                        )

                        if not failure_email_sent:
                            try:
                                send_payment_failed_email(
                                    recipient_email=user.get("email"),
                                    customer_name=user.get(
                                        "name",
                                        "Customer"
                                    ),
                                    amount=amount_rupees,
                                    payment_id=payment_id or "Unavailable",
                                    failure_reason=failure_reason
                                )

                                if payment_id:
                                    payments_collection.update_one(
                                        {
                                            "payment_id": payment_id
                                        },
                                        {
                                            "$set": {
                                                "failureEmailSent": True,
                                                "failureEmailSentAt": datetime.utcnow()
                                            }
                                        }
                                    )

                                print(
                                    "Payment failure email sent to:",
                                    user.get("email")
                                )

                            except Exception as e:
                                print(
                                    "Payment failure email error:",
                                    e
                                )

                        try:
                            create_notification(
                                user_email=user.get("email"),
                                notification_type="payment_failed",
                                title="Payment Failed",
                                message=f"Your recent payment of ₹{amount_rupees} could not be completed.",
                                metadata={
                                    "amount": amount_rupees,
                                    "paymentId": payment_id or "Unavailable",
                                    "reason": failure_reason
                                }
                            )
                        except Exception as e:
                            print(
                                "Payment failure notification error:",
                                e
                            )
                    else:
                        print(
                            "Payment failed, but BillFlow user could not be matched:",
                            payment_id
                        )

            # Do not activate a subscription from a generic payment
            # webhook. The existing verify-payment endpoint already
            # validates the checkout signature and owns first-time
            # subscription activation.
            print(
                "Processed Razorpay payment webhook:",
                event_name,
                payment_id
            )

        # --------------------------------------------------------
        # RECURRING SUBSCRIPTION CHARGE
        # --------------------------------------------------------

        elif event_name == "subscription.charged":
            subscription_wrapper = payload_data.get(
                "subscription",
                {}
            )

            subscription_entity = subscription_wrapper.get(
                "entity",
                {}
            )

            payment_wrapper = payload_data.get(
                "payment",
                {}
            )

            payment_entity = payment_wrapper.get(
                "entity",
                {}
            )

            subscription_id = subscription_entity.get("id")
            payment_id = payment_entity.get("id")

            user = _find_user_for_subscription(
                subscription_entity,
                payment_entity
            )

            if not user:
                print(
                    "Subscription charge webhook received, but user could not be matched:",
                    subscription_id
                )

            else:
                current_start = _razorpay_timestamp_to_datetime(
                    subscription_entity.get("current_start")
                )

                current_end = _razorpay_timestamp_to_datetime(
                    subscription_entity.get("current_end")
                )

                plan_name = user.get(
                    "subscriptionPlan",
                    "Free"
                )

                amount = round(
                    float(payment_entity.get("amount", 0)) / 100,
                    2
                )

                payment_already_exists = False

                if payment_id:
                    payment_already_exists = payments_collection.find_one(
                        {
                            "payment_id": payment_id
                        }
                    ) is not None

                # Store the recurring payment only once.
                if payment_id and not payment_already_exists:
                    recurring_payment = {
                        "email": user.get(
                            "email",
                            payment_entity.get("email", "")
                        ),
                        "plan": plan_name,
                        "amount": amount,
                        "currency": payment_entity.get(
                            "currency",
                            "INR"
                        ),
                        "payment_id": payment_id,
                        "order_id": payment_entity.get(
                            "order_id"
                        ),
                        "subscription_id": subscription_id,
                        "status": "Success",
                        "payment_date": datetime.utcnow(),
                        "subscription_start": current_start,
                        "subscription_end": current_end,
                        "payment_source": "razorpay_subscription",
                        "webhookEvent": event_name
                    }

                    payments_collection.insert_one(
                        recurring_payment
                    )

                users_collection.update_one(
                    {
                        "email": user.get("email")
                    },
                    {
                        "$set": {
                            "subscriptionStatus": "Active",
                            "subscriptionStart": current_start,
                            "subscriptionEnd": current_end,
                            "autoRenew": True,
                            "cancelledAt": None,
                            "expiryEmailSent": False,
                            "razorpaySubscriptionId": subscription_id,
                            "lastPaymentStatus": "Success"
                        }
                    }
                )

                # Only send notifications for a newly recorded recurring
                # payment. This keeps webhook retries idempotent.
                if payment_id and not payment_already_exists:
                    try:
                        send_payment_success_email(
                            recipient_email=user.get("email"),
                            customer_name=user.get(
                                "name",
                                "Customer"
                            ),
                            plan_name=plan_name,
                            amount=amount,
                            payment_id=payment_id,
                            subscription_start=current_start,
                            subscription_end=current_end
                        )

                        print(
                            "Recurring payment success email sent to:",
                            user.get("email")
                        )

                    except Exception as e:
                        print(
                            "Recurring payment success email error:",
                            e
                        )

                    try:
                        invoice_payment = {
                            "email": user.get("email", ""),
                            "plan": plan_name,
                            "amount": amount,
                            "currency": payment_entity.get(
                                "currency",
                                "INR"
                            ),
                            "payment_id": payment_id,
                            "order_id": payment_entity.get(
                                "order_id",
                                ""
                            ),
                            "status": "Success",
                            "payment_date": datetime.utcnow(),
                            "subscription_start": current_start,
                            "subscription_end": current_end
                        }

                        invoice_pdf = create_invoice_pdf(
                            invoice_payment,
                            user
                        )

                        send_invoice_email(
                            recipient_email=user.get("email"),
                            customer_name=user.get(
                                "name",
                                "Customer"
                            ),
                            plan_name=plan_name,
                            amount=amount,
                            payment_id=payment_id,
                            subscription_start=current_start,
                            subscription_end=current_end,
                            pdf_bytes=invoice_pdf
                        )

                        print(
                            "Recurring invoice email sent to:",
                            user.get("email")
                        )

                    except Exception as e:
                        print(
                            "Recurring invoice email error:",
                            e
                        )

                print(
                    "Processed Razorpay subscription charge:",
                    subscription_id,
                    payment_id
                )

        # --------------------------------------------------------
        # SUBSCRIPTION STATE EVENTS
        # --------------------------------------------------------

        elif event_name in {
            "subscription.cancelled",
            "subscription.paused",
            "subscription.resumed",
            "subscription.halted",
            "subscription.completed"
        }:
            subscription_wrapper = payload_data.get(
                "subscription",
                {}
            )

            subscription_entity = subscription_wrapper.get(
                "entity",
                {}
            )

            subscription_id = subscription_entity.get("id")
            user = _find_user_for_subscription(
                subscription_entity
            )

            if not user:
                print(
                    "Subscription state webhook received, but user could not be matched:",
                    subscription_id
                )

            else:
                update_fields = {
                    "razorpaySubscriptionId": subscription_id,
                    "razorpaySubscriptionStatus": subscription_entity.get(
                        "status"
                    )
                }

                if event_name == "subscription.resumed":
                    update_fields.update({
                        "subscriptionStatus": "Active",
                        "autoRenew": True,
                        "cancelledAt": None
                    })

                elif event_name == "subscription.paused":
                    update_fields.update({
                        "subscriptionStatus": "Paused",
                        "autoRenew": False
                    })

                elif event_name == "subscription.halted":
                    update_fields.update({
                        "subscriptionStatus": "Payment Failed",
                        "autoRenew": False,
                        "lastPaymentStatus": "Failed"
                    })

                elif event_name == "subscription.cancelled":
                    cancellation_timestamp = subscription_entity.get(
                        "ended_at"
                    )

                    update_fields.update({
                        "autoRenew": False,
                        "cancelledAt": _razorpay_timestamp_to_datetime(
                            cancellation_timestamp
                        ) if cancellation_timestamp else datetime.utcnow()
                    })

                elif event_name == "subscription.completed":
                    update_fields.update({
                        "autoRenew": False
                    })

                users_collection.update_one(
                    {
                        "email": user.get("email")
                    },
                    {
                        "$set": update_fields
                    }
                )

                print(
                    "Processed Razorpay subscription webhook:",
                    event_name,
                    subscription_id
                )

        else:
            # Keep unknown/future events acknowledged after signature
            # validation so they do not create unnecessary retry loops.
            print(
                "Unhandled Razorpay webhook event:",
                event_name
            )

        webhook_events_collection.update_one(
            {
                "event_hash": event_hash
            },
            {
                "$set": {
                    "processed": True,
                    "processed_at": datetime.utcnow()
                }
            }
        )

        return {
            "status": "ok",
            "event": event_name
        }

    except Exception as e:
        webhook_events_collection.update_one(
            {
                "event_hash": event_hash
            },
            {
                "$set": {
                    "processed": False,
                    "processing_error": str(e),
                    "failed_at": datetime.utcnow()
                }
            }
        )

        print(
            "Razorpay webhook processing error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Webhook processing failed"
        )


# ============================================================
# DEVELOPMENT TEST: PAYMENT FAILURE EMAIL
# ============================================================
# This endpoint is disabled unless ENABLE_EMAIL_TEST_ENDPOINTS=true.
# It is intended only for local testing and should remain disabled in production.

@router.post("/test-payment-failure-email/{email}")
def test_payment_failure_email(email: str):

    if os.getenv("ENABLE_EMAIL_TEST_ENDPOINTS", "false").lower() != "true":
        raise HTTPException(
            status_code=404,
            detail="Not found"
        )

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    test_payment_id = "TEST_FAILED_PAYMENT"
    test_amount = PLAN_PRICES.get(
        user.get("subscriptionPlan", "Pro"),
        499
    )
    failure_reason = "Test payment failure - Razorpay test event"

    send_payment_failed_email(
        recipient_email=email,
        customer_name=user.get("name", "Customer"),
        amount=test_amount,
        payment_id=test_payment_id,
        failure_reason=failure_reason
    )

    return {
        "message": "Test payment failure email sent",
        "email": email
    }


# ============================================================
# GET BILLING HISTORY
# ============================================================

@router.get("/history/{email}")
def get_billing_history(email: str):

    payments = list(
        payments_collection.find(
            {
                "email": email
            },
            {
                "_id": 0
            }
        ).sort(
            "payment_date",
            -1
        )
    )

    return payments


# ============================================================
# GET CURRENT SUBSCRIPTION
# ============================================================

@router.get("/subscription/{email}")
def get_subscription(email: str):

    user = users_collection.find_one(
        {
            "email": email
        },
        {
            "_id": 0,
            "password": 0
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    subscription_status = user.get(
        "subscriptionStatus",
        "Inactive"
    )

    subscription_end = user.get(
        "subscriptionEnd"
    )
    # --------------------------------------------------------
    # Check Subscription Expiry
    # --------------------------------------------------------

    if (
        subscription_status == "Active"
        and subscription_end
    ):

        if datetime.utcnow() >= subscription_end:

            # Mark subscription as expired
            users_collection.update_one(
                {
                    "email": email
                },
                {
                    "$set": {
                        "subscriptionStatus": "Expired",
                        "autoRenew": False
                    }
                }
            )

            subscription_status = "Expired"

            # ------------------------------------------------
            # SEND EXPIRY EMAIL ONLY ONCE
            # ------------------------------------------------

            if not user.get("expiryEmailSent", False):

                try:

                    send_subscription_expired_email(
                        recipient_email=email,
                        customer_name=user.get(
                            "name",
                            "Customer"
                        ),
                        plan_name=user.get(
                            "subscriptionPlan",
                            "Free"
                        ),
                        subscription_end=subscription_end
                    )

                    print(
                        "Subscription expiry email sent to:",
                        email
                    )

                    try:
                        create_notification(
                            user_email=email,
                            notification_type="subscription_expired",
                            title="Subscription Expired",
                            message=f"Your {user.get('subscriptionPlan', 'Free')} subscription has expired.",
                            metadata={
                                "plan": user.get("subscriptionPlan", "Free"),
                                "subscriptionEnd": subscription_end
                            }
                        )
                    except Exception as notification_error:
                        print(
                            "Subscription expiry notification error:",
                            notification_error
                        )

                    # Record that the email was sent
                    users_collection.update_one(
                        {
                            "email": email
                        },
                        {
                            "$set": {
                                "expiryEmailSent": True
                            }
                        }
                    )

                except Exception as e:

                    print(
                        "Subscription expiry email error:",
                        e
                    )
    return {
        "plan": user.get(
            "subscriptionPlan",
            "Free"
        ),

        "status": subscription_status,

        "subscriptionStart": user.get(
            "subscriptionStart"
        ),

        "subscriptionEnd": user.get(
            "subscriptionEnd"
        ),

        "autoRenew": user.get(
            "autoRenew",
            False
        ),

        "cancelledAt": user.get(
            "cancelledAt"
        )
    }

# ============================================================
# CANCEL AUTO-RENEWAL
# ============================================================

@router.post("/subscription/cancel")
def cancel_subscription(data: dict):

    email = data.get(
        "email"
    )

    if not email:

        raise HTTPException(
            status_code=400,
            detail="Email is required"
        )

    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.get(
        "subscriptionStatus"
    ) != "Active":

        raise HTTPException(
            status_code=400,
            detail="No active subscription"
        )

    # --------------------------------------------------------
    # Important:
    #
    # We DO NOT change subscriptionStatus to "Cancelled".
    #
    # The user has already paid for the current period.
    # They should continue to have access until subscriptionEnd.
    #
    # We only disable auto-renewal.
    # --------------------------------------------------------

    cancellation_time = datetime.utcnow()

    users_collection.update_one(
        {
            "email": email
        },
        {
            "$set": {

                "autoRenew": False,

                "cancelledAt": cancellation_time
            }
        }
    )
    # --------------------------------------------------------
    # SEND SUBSCRIPTION CANCELLATION EMAIL
    # --------------------------------------------------------

    try:

        send_subscription_cancelled_email(
            recipient_email=email,
            customer_name=user.get(
                "name",
                "Customer"
            ),
            plan_name=user.get(
                "subscriptionPlan",
                "Free"
            ),
            cancelled_at=cancellation_time,
            subscription_end=user.get(
                "subscriptionEnd"
            )
        )

        print(
            "Subscription cancellation email sent to:",
            email
        )

    except Exception as e:

        print(
            "Subscription cancellation email error:",
            e
        )

    try:
        create_notification(
            user_email=email,
            notification_type="subscription_cancelled",
            title="Subscription Cancellation Scheduled",
            message=f"Auto-renewal for your {user.get('subscriptionPlan', 'Free')} plan has been cancelled. Access remains available until the current expiry date.",
            metadata={
                "plan": user.get("subscriptionPlan", "Free"),
                "subscriptionEnd": user.get("subscriptionEnd")
            }
        )
    except Exception as e:
        print(
            "Subscription cancellation notification error:",
            e
        )

    return {

        "message": "Auto-renewal cancelled successfully",

        "subscriptionStatus": "Active",

        "autoRenew": False
    }


# ============================================================
# GENERATE INVOICE
# ============================================================

@router.get("/invoice/{payment_id}")
def generate_invoice(payment_id: str):

    payment = payments_collection.find_one(
        {
            "payment_id": payment_id
        }
    )

    if not payment:

        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    try:

        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors

        from fastapi.responses import StreamingResponse

        from io import BytesIO

        # ----------------------------------------------------
        # Get User
        # ----------------------------------------------------

        user = users_collection.find_one(
            {
                "email": payment.get("email")
            }
        )

        user_name = (
            user.get("name")
            if user
            else "Customer"
        )

        user_email = payment.get(
            "email",
            ""
        )

        # ----------------------------------------------------
        # Invoice Data
        # ----------------------------------------------------

        plan = payment.get(
            "plan",
            "Unknown"
        )

        amount = payment.get(
            "amount",
            0
        )

        currency = payment.get(
            "currency",
            "INR"
        )

        payment_date = payment.get(
            "payment_date"
        )

        subscription_start = payment.get(
            "subscription_start"
        )

        subscription_end = payment.get(
            "subscription_end"
        )

        payment_id_value = payment.get(
            "payment_id",
            ""
        )

        order_id = payment.get(
            "order_id",
            ""
        )

        status = payment.get(
            "status",
            "Success"
        )

        # ----------------------------------------------------
        # PDF Setup
        # ----------------------------------------------------

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer,
            pagesize=A4
        )

        width, height = A4

        # ----------------------------------------------------
        # Header
        # ----------------------------------------------------

        pdf.setFillColor(
            colors.HexColor("#2563eb")
        )

        pdf.rect(
            0,
            height - 100,
            width,
            100,
            fill=1,
            stroke=0
        )

        pdf.setFillColor(
            colors.white
        )

        pdf.setFont(
            "Helvetica-Bold",
            24
        )

        pdf.drawString(
            50,
            height - 55,
            "BillFlow"
        )

        pdf.setFont(
            "Helvetica",
            11
        )

        pdf.drawString(
            50,
            height - 75,
            "Subscription Billing Platform"
        )

        # ----------------------------------------------------
        # Invoice Title
        # ----------------------------------------------------

        pdf.setFillColor(
            colors.black
        )

        pdf.setFont(
            "Helvetica-Bold",
            22
        )

        pdf.drawRightString(
            width - 50,
            height - 145,
            "INVOICE"
        )

        # ----------------------------------------------------
        # Invoice Information
        # ----------------------------------------------------

        y = height - 185

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            50,
            y,
            "Payment ID:"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            135,
            y,
            str(payment_id_value)
        )

        y -= 20

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            50,
            y,
            "Order ID:"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            135,
            y,
            str(order_id)
        )

        y -= 20

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            50,
            y,
            "Payment Date:"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            135,
            y,
            str(payment_date)
        )

        # ----------------------------------------------------
        # Customer Information
        # ----------------------------------------------------

        y -= 45

        pdf.setFont(
            "Helvetica-Bold",
            12
        )

        pdf.drawString(
            50,
            y,
            "Bill To"
        )

        y -= 20

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            50,
            y,
            str(user_name)
        )

        y -= 16

        pdf.drawString(
            50,
            y,
            str(user_email)
        )

        # ----------------------------------------------------
        # Table Header
        # ----------------------------------------------------

        y -= 45

        pdf.setFillColor(
            colors.HexColor("#f3f4f6")
        )

        pdf.rect(
            50,
            y - 8,
            width - 100,
            30,
            fill=1,
            stroke=0
        )

        pdf.setFillColor(
            colors.black
        )

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            60,
            y + 2,
            "Description"
        )

        pdf.drawRightString(
            width - 60,
            y + 2,
            "Amount"
        )

        # ----------------------------------------------------
        # Plan Row
        # ----------------------------------------------------

        y -= 35

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            60,
            y,
            f"{plan} Subscription"
        )

        pdf.drawRightString(
            width - 60,
            y,
            f"{currency} {amount}"
        )

        # ----------------------------------------------------
        # Billing Period
        # ----------------------------------------------------

        y -= 25

        pdf.setFont(
            "Helvetica",
            9
        )

        pdf.drawString(
            60,
            y,
            "Billing Period"
        )

        y -= 15

        pdf.drawString(
            60,
            y,
            f"{subscription_start}  to  {subscription_end}"
        )

        # ----------------------------------------------------
        # Total
        # ----------------------------------------------------

        y -= 40

        pdf.setLineWidth(
            1
        )

        pdf.line(
            50,
            y,
            width - 50,
            y
        )

        y -= 30

        pdf.setFont(
            "Helvetica-Bold",
            14
        )

        pdf.drawString(
            50,
            y,
            "Total"
        )

        pdf.drawRightString(
            width - 60,
            y,
            f"{currency} {amount}"
        )

        # ----------------------------------------------------
        # Payment Status
        # ----------------------------------------------------

        y -= 35

        pdf.setFont(
            "Helvetica-Bold",
            11
        )

        pdf.drawString(
            50,
            y,
            "Payment Status:"
        )

        pdf.setFont(
            "Helvetica",
            11
        )

        pdf.drawString(
            160,
            y,
            str(status)
        )

        # ----------------------------------------------------
        # Footer
        # ----------------------------------------------------

        pdf.setFont(
            "Helvetica",
            9
        )

        pdf.setFillColor(
            colors.grey
        )

        pdf.drawCentredString(
            width / 2,
            45,
            "Thank you for choosing BillFlow."
        )

        pdf.drawCentredString(
            width / 2,
            30,
            "This is a computer-generated invoice."
        )

        # ----------------------------------------------------
        # Finish PDF
        # ----------------------------------------------------

        pdf.save()

        buffer.seek(0)

        filename = (
            f"BillFlow_Invoice_{payment_id}.pdf"
        )

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition":
                f'attachment; filename="{filename}"'
            }
        )

    except Exception as e:

        print(
            "Invoice Generation Error:",
            e
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate invoice"
        )


# ============================================================
# ADMIN ANALYTICS
# ============================================================

@router.get("/admin/analytics")
def admin_analytics():

    # --------------------------------------------------------
    # User Statistics
    # --------------------------------------------------------

    total_users = users_collection.count_documents({})

    active_subscriptions = users_collection.count_documents({
        "subscriptionStatus": "Active"
    })

    expired_subscriptions = users_collection.count_documents({
        "subscriptionStatus": "Expired"
    })

    paused_subscriptions = users_collection.count_documents({
        "subscriptionStatus": "Paused"
    })

    # Cancellation means auto-renewal was disabled while the
    # subscription is still active for its paid period.
    cancelled_subscriptions = users_collection.count_documents({
        "subscriptionStatus": "Active",
        "autoRenew": False
    })

    # --------------------------------------------------------
    # Payment Statistics
    # --------------------------------------------------------

    successful_payments = list(
        payments_collection.find(
            {"status": "Success"},
            {"_id": 0}
        ).sort("payment_date", -1)
    )

    failed_payments = list(
        payments_collection.find(
            {"status": "Failed"},
            {"_id": 0}
        ).sort("payment_date", -1)
    )

    total_payments = payments_collection.count_documents({})

    successful_payment_count = len(successful_payments)
    failed_payment_count = len(failed_payments)

    # --------------------------------------------------------
    # Revenue
    # --------------------------------------------------------

    total_revenue = sum(
        float(payment.get("amount", 0) or 0)
        for payment in successful_payments
    )

    average_payment = (
        total_revenue / successful_payment_count
        if successful_payment_count
        else 0
    )

    # --------------------------------------------------------
    # Plan Distribution
    # --------------------------------------------------------

    plan_distribution = {
        "Free": users_collection.count_documents({
            "subscriptionPlan": "Free"
        }),
        "Pro": users_collection.count_documents({
            "subscriptionPlan": "Pro"
        }),
        "Enterprise": users_collection.count_documents({
            "subscriptionPlan": "Enterprise"
        })
    }

    # --------------------------------------------------------
    # Revenue By Plan
    # --------------------------------------------------------

    revenue_by_plan = {
        "Free": 0,
        "Pro": 0,
        "Enterprise": 0
    }

    for payment in successful_payments:
        plan = payment.get("plan", "Unknown")
        amount = float(payment.get("amount", 0) or 0)

        if plan not in revenue_by_plan:
            revenue_by_plan[plan] = 0

        revenue_by_plan[plan] += amount

    # --------------------------------------------------------
    # Payment Status Distribution
    # --------------------------------------------------------

    payment_status_distribution = {
        "Success": successful_payment_count,
        "Failed": failed_payment_count,
        "Other": max(
            total_payments
            - successful_payment_count
            - failed_payment_count,
            0
        )
    }

    # --------------------------------------------------------
    # Revenue Trend - Last 30 Days
    # --------------------------------------------------------

    now = datetime.utcnow()
    start_date = (now - timedelta(days=29)).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    daily_map = {}

    for index in range(30):
        day = start_date + timedelta(days=index)
        key = day.strftime("%Y-%m-%d")
        daily_map[key] = {
            "date": key,
            "label": day.strftime("%d %b"),
            "revenue": 0,
            "payments": 0
        }

    for payment in successful_payments:
        payment_date = payment.get("payment_date")

        if isinstance(payment_date, str):
            try:
                payment_date = datetime.fromisoformat(
                    payment_date.replace("Z", "+00:00")
                )
                if payment_date.tzinfo:
                    payment_date = payment_date.replace(tzinfo=None)
            except ValueError:
                continue

        if not isinstance(payment_date, datetime):
            continue

        key = payment_date.strftime("%Y-%m-%d")

        if key in daily_map:
            daily_map[key]["revenue"] += float(
                payment.get("amount", 0) or 0
            )
            daily_map[key]["payments"] += 1

    revenue_trend = list(daily_map.values())

    # --------------------------------------------------------
    # Recent Payments
    # --------------------------------------------------------

    recent_payments = list(
        payments_collection.find(
            {},
            {
                "_id": 0,
                "email": 1,
                "plan": 1,
                "amount": 1,
                "currency": 1,
                "payment_id": 1,
                "status": 1,
                "payment_date": 1
            }
        ).sort("payment_date", -1).limit(10)
    )

    # --------------------------------------------------------
    # Return Analytics
    # --------------------------------------------------------

    return {
        "totalUsers": total_users,
        "activeSubscriptions": active_subscriptions,
        "cancelledSubscriptions": cancelled_subscriptions,
        "expiredSubscriptions": expired_subscriptions,
        "pausedSubscriptions": paused_subscriptions,
        "totalPayments": total_payments,
        "successfulPayments": successful_payment_count,
        "failedPayments": failed_payment_count,
        "totalRevenue": total_revenue,
        "averagePayment": average_payment,
        "planDistribution": plan_distribution,
        "revenueByPlan": revenue_by_plan,
        "paymentStatusDistribution": payment_status_distribution,
        "revenueTrend": revenue_trend,
        "recentPayments": recent_payments
    }
