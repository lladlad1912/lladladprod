# Newsletter Subscription (Minimal)

## Goal

Show a **“Subscribe to Newsletter”** call-to-action to logged-in users **until they subscribe**. After subscribing, the CTA is hidden for that user.

## Frontend

- Sidebar CTA is rendered in:
  - `frontend/src/components/Sidebar.js`
- The CTA is shown when:
  - `user` exists AND `user.newsletterSubscribed` is `false`
- On click:
  - Calls `POST /api/newsletter/subscribe`
  - Then calls `loadCurrentUser()` to refresh the user state (so CTA hides)

## Backend

- User table has fields:
  - `newsletter_subscribed` (boolean, default `false`)
  - `newsletter_subscribed_at` (timestamp)
  - Implemented in `src/main/java/com/blogapp/model/User.java`

- API:
  - `GET /api/newsletter/status` → `{ subscribed, subscribedAt }`
  - `POST /api/newsletter/subscribe` → sets subscribed = true for current user
  - Controller: `src/main/java/com/blogapp/controller/NewsletterController.java`

- Security:
  - `SecurityConfig` protects `/api/newsletter/**` (authenticated)

## Next steps (Production)

- Store subscriptions in a dedicated table (email, status, source, double-opt-in token).
- Send a real email using SMTP provider (SendGrid/Mailgun/SES).
- Add unsubscribe flow + compliance (CAN-SPAM / GDPR depending on region).











