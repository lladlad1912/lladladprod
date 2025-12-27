# Razorpay Payments (Minimal Integration)

This repo now includes a **minimal Razorpay integration** to validate the payment flow for a future Products module.

## What’s implemented

- **Frontend**
  - `frontend/src/components/ProductsPage.js` (`/products`)
  - Loads Razorpay Checkout script (`checkout.js`)
  - Calls backend to create an order
  - Opens Razorpay checkout
  - Calls backend to verify the payment signature

- **Backend**
  - Dependency: `com.razorpay:razorpay-java`
  - `POST /api/payments/razorpay/order` → creates Razorpay Order (authenticated)
  - `POST /api/payments/razorpay/verify` → verifies signature (authenticated)
  - Security: `SecurityConfig` allows authenticated access to `/api/payments/**`

## Configuration (Test Mode)

Add Razorpay keys (test mode) in `src/main/resources/application.properties` (recommended: use env vars/secret store in prod):

```properties
razorpay.key-id=rzp_test_xxxxxxxxxxxxx
razorpay.key-secret=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Template values are added in `src/main/resources/application.properties.example`.

## API Contracts

### Create Order

**POST** `/api/payments/razorpay/order`

Request:

```json
{
  "amount": 100,
  "currency": "INR",
  "receipt": "prod_starter_1700000000000"
}
```

Response:

```json
{
  "keyId": "rzp_test_...",
  "orderId": "order_...",
  "amount": 100,
  "currency": "INR"
}
```

### Verify Signature

**POST** `/api/payments/razorpay/verify`

Request:

```json
{
  "razorpayOrderId": "order_...",
  "razorpayPaymentId": "pay_...",
  "razorpaySignature": "..."
}
```

Response:

```json
{
  "verified": true
}
```

## Notes / Next Steps (Production-grade)

- **Always verify server-side** (already implemented), and if verification fails treat payment as invalid.
- Add a DB table for orders/payments (status machine: CREATED → PAID → FULFILLED / FAILED).
- Add webhook handling from Razorpay to reconcile payment status.
- Add idempotency (avoid double-charging / double-fulfillment).
- Restrict create-order inputs (server should compute amount from product ID, not trust client amount).











