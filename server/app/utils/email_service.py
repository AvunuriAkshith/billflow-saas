import os
import resend
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM", "onboarding@resend.dev")


def send_password_reset_email(recipient_email: str, reset_link: str):

    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Reset your BillFlow password",
        "html": f"""
        <h2>Reset Your BillFlow Password</h2>

        <p>You requested to reset your BillFlow password.</p>

        <p>
            <a href="{reset_link}">
                Reset Password
            </a>
        </p>

        <p>This link will expire in 15 minutes.</p>

        <p>If you did not request this, you can ignore this email.</p>
        """
    }

    return resend.Emails.send(params)
def send_payment_success_email(
    recipient_email: str,
    customer_name: str,
    plan_name: str,
    amount: int,
    payment_id: str,
    subscription_start,
    subscription_end
):
    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Payment Successful - BillFlow",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
        ">

            <div style="
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
            ">
                <h1 style="margin: 0;">BillFlow</h1>
                <p style="margin-top: 8px;">
                    Subscription Billing Platform
                </p>
            </div>

            <div style="
                background: white;
                padding: 30px;
                margin-top: 20px;
                border-radius: 12px;
            ">

                <h2 style="color: #16a34a;">
                    ✓ Payment Successful
                </h2>

                <p>Hello {customer_name},</p>

                <p>
                    Your payment has been successfully processed.
                    Your BillFlow subscription is now active.
                </p>

                <hr>

                <h3>Payment Details</h3>

                <p>
                    <strong>Plan:</strong> {plan_name}
                </p>

                <p>
                    <strong>Amount:</strong> ₹{amount}
                </p>

                <p>
                    <strong>Payment ID:</strong> {payment_id}
                </p>

                <p>
                    <strong>Subscription Start:</strong>
                    {subscription_start}
                </p>

                <p>
                    <strong>Subscription End:</strong>
                    {subscription_end}
                </p>

                <hr>

                <p>
                    You can view your billing history and download
                    your invoice from your BillFlow dashboard.
                </p>

                <p style="margin-top: 30px;">
                    Thank you for choosing BillFlow.
                </p>

            </div>

            <p style="
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 20px;
            ">
                This is an automated email from BillFlow.
            </p>

        </div>
        """
    }

    return resend.Emails.send(params)
def send_subscription_cancelled_email(
    recipient_email: str,
    customer_name: str,
    plan_name: str,
    cancelled_at,
    subscription_end
):
    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Subscription Auto-Renewal Cancelled - BillFlow",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
        ">

            <div style="
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
            ">
                <h1 style="margin: 0;">BillFlow</h1>
                <p style="margin-top: 8px;">
                    Subscription Billing Platform
                </p>
            </div>

            <div style="
                background: white;
                padding: 30px;
                margin-top: 20px;
                border-radius: 12px;
            ">

                <h2 style="color: #f59e0b;">
                    Auto-Renewal Cancelled
                </h2>

                <p>
                    Hello {customer_name},
                </p>

                <p>
                    Your BillFlow subscription auto-renewal
                    has been successfully cancelled.
                </p>

                <hr>

                <h3>Subscription Details</h3>

                <p>
                    <strong>Plan:</strong>
                    {plan_name}
                </p>

                <p>
                    <strong>Cancelled On:</strong>
                    {cancelled_at}
                </p>

                <p>
                    <strong>Subscription Active Until:</strong>
                    {subscription_end}
                </p>

                <p>
                    Your current subscription will remain active
                    until the expiry date shown above.
                    No further automatic renewal will occur.
                </p>

                <hr>

                <p>
                    You can continue using your BillFlow subscription
                    until the current billing period ends.
                </p>

                <p style="margin-top: 30px;">
                    Thank you for using BillFlow.
                </p>

            </div>

            <p style="
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 20px;
            ">
                This is an automated email from BillFlow.
            </p>

        </div>
        """
    }

    return resend.Emails.send(params)
def send_subscription_expired_email(
    recipient_email: str,
    customer_name: str,
    plan_name: str,
    subscription_end
):
    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Your BillFlow Subscription Has Expired",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
        ">

            <div style="
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
            ">
                <h1 style="margin: 0;">BillFlow</h1>
                <p style="margin-top: 8px;">
                    Subscription Billing Platform
                </p>
            </div>

            <div style="
                background: white;
                padding: 30px;
                margin-top: 20px;
                border-radius: 12px;
            ">

                <h2 style="color: #dc2626;">
                    Subscription Expired
                </h2>

                <p>
                    Hello {customer_name},
                </p>

                <p>
                    Your BillFlow subscription has expired.
                </p>

                <hr>

                <h3>Subscription Details</h3>

                <p>
                    <strong>Plan:</strong>
                    {plan_name}
                </p>

                <p>
                    <strong>Subscription End Date:</strong>
                    {subscription_end}
                </p>

                <p>
                    Your subscription is no longer active.
                </p>

                <p>
                    You can choose a subscription plan again
                    from the BillFlow Plans page to continue
                    using premium features.
                </p>

                <hr>

                <p style="margin-top: 30px;">
                    Thank you for using BillFlow.
                </p>

            </div>

            <p style="
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 20px;
            ">
                This is an automated email from BillFlow.
            </p>

        </div>
        """
    }

    return resend.Emails.send(params)
import base64
def send_invoice_email(
    recipient_email: str,
    customer_name: str,
    plan_name: str,
    amount: int,
    payment_id: str,
    subscription_start,
    subscription_end,
    pdf_bytes: bytes
):
    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    pdf_base64 = base64.b64encode(
        pdf_bytes
    ).decode("utf-8")

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Payment Receipt & Invoice - BillFlow",
        "html": f"""
        <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            background: #f8fafc;
        ">

            <div style="
                background: linear-gradient(135deg, #2563eb, #7c3aed);
                color: white;
                padding: 25px;
                border-radius: 12px;
                text-align: center;
            ">
                <h1 style="margin: 0;">BillFlow</h1>
                <p style="margin-top: 8px;">
                    Subscription Billing Platform
                </p>
            </div>

            <div style="
                background: white;
                padding: 30px;
                margin-top: 20px;
                border-radius: 12px;
            ">

                <h2 style="color: #16a34a;">
                    Payment Receipt & Invoice
                </h2>

                <p>
                    Hello {customer_name},
                </p>

                <p>
                    Thank you for your payment.
                    Your subscription has been successfully activated.
                </p>

                <hr>

                <h3>Payment Details</h3>

                <p>
                    <strong>Plan:</strong>
                    {plan_name}
                </p>

                <p>
                    <strong>Amount:</strong>
                    ₹{amount}
                </p>

                <p>
                    <strong>Payment ID:</strong>
                    {payment_id}
                </p>

                <p>
                    <strong>Subscription Start:</strong>
                    {subscription_start}
                </p>

                <p>
                    <strong>Subscription End:</strong>
                    {subscription_end}
                </p>

                <hr>

                <p>
                    Your invoice is attached to this email as a PDF.
                </p>

                <p style="margin-top: 30px;">
                    Thank you for choosing BillFlow.
                </p>

            </div>

            <p style="
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 20px;
            ">
                This is an automated email from BillFlow.
            </p>

        </div>
        """,
        "attachments": [
            {
                "filename": f"BillFlow_Invoice_{payment_id}.pdf",
                "content": pdf_base64,
                "content_type": "application/pdf"
            }
        ]
    }

    return resend.Emails.send(params)
def send_payment_failed_email(
    recipient_email: str,
    customer_name: str,
    amount: float,
    payment_id: str,
    failure_reason: str
):
    if not RESEND_API_KEY:
        raise Exception("RESEND_API_KEY is not configured")

    resend.api_key = RESEND_API_KEY

    params = {
        "from": f"BillFlow <{EMAIL_FROM}>",
        "to": [recipient_email],
        "subject": "Payment Failed - BillFlow",
        "html": f"""
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 24px;">

            <div style="background: #dc2626; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0;">BillFlow</h1>
                <p style="margin: 8px 0 0;">Payment Failure Notification</p>
            </div>

            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">

                <h2 style="color: #111827;">Hello {customer_name},</h2>

                <p style="color: #374151; line-height: 1.6;">
                    We could not complete your recent BillFlow payment.
                </p>

                <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Amount:</strong> ₹{amount}</p>
                    <p><strong>Payment ID:</strong> {payment_id}</p>
                    <p><strong>Reason:</strong> {failure_reason}</p>
                </div>

                <p style="color: #374151; line-height: 1.6;">
                    Please try the payment again. If the issue continues, please check
                    your payment method or contact your bank/payment provider.
                </p>

                <p style="color: #6b7280; margin-top: 28px;">
                    No successful payment was recorded for this failed attempt.
                </p>

                <p style="color: #6b7280; margin-top: 24px;">
                    Regards,<br>
                    BillFlow Team
                </p>

            </div>
        </div>
        """
    }

    return resend.Emails.send(params)