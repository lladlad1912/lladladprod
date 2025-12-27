# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for the BlogApp.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to Google Cloud Console

## Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: `lladlad` (or your app name)
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (for development)
   - Click **Save and Continue**

6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `BlogApp Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Click **Create**

7. Copy the **Client ID** (you'll need this for the frontend)

## Step 2: Configure Frontend

1. Create a `.env` file in the `frontend` directory:
   ```bash
   cd frontend
   touch .env
   ```

2. Add your Google Client ID to the `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```

3. Restart your React development server:
   ```bash
   npm start
   ```

## Step 3: Test the Integration

1. Navigate to the login page
2. You should see a "Sign in with Google" button
3. Click the button and complete the Google sign-in flow
4. For first-time users, you'll be redirected to the profile setup page
5. Complete your profile and you'll be logged in

## How It Works

### First-Time Google Users

1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User authorizes the application
4. Backend receives Google user data and creates a new user account
5. Backend returns `needsProfileSetup: true` flag
6. Frontend redirects to `/profile/setup`
7. User completes profile (username, first name, last name, bio, profile image)
8. User is redirected to home page

### Returning Google Users

1. User clicks "Sign in with Google"
2. Google authentication popup appears
3. User authorizes (or is already logged in to Google)
4. Backend finds existing user by email
5. Backend returns JWT token
6. Frontend stores token and redirects to home page

## Backend Endpoint

The backend endpoint `/api/oauth2/google/callback` expects:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://...",
  "sub": "google-user-id"
}
```

And returns:

```json
{
  "token": "jwt-token-here",
  "id": 1,
  "username": "user_123",
  "email": "user@example.com",
  "needsProfileSetup": true  // Only for first-time users
}
```

## Troubleshooting

### "Google OAuth not configured" error

- Make sure you've created a `.env` file in the `frontend` directory
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
- Restart your React development server after adding the environment variable

### "Google Sign-In is not loaded" error

- Check your browser console for script loading errors
- Verify the Google Identity Services script is loading in `public/index.html`
- Check your network connection

### "Invalid client" error

- Verify your Client ID is correct
- Check that `http://localhost:3000` is added to Authorized JavaScript origins
- Make sure you're using the Web application client ID (not iOS/Android)

### Redirect URI mismatch

- Ensure the redirect URI in Google Console matches your application URL
- For development: `http://localhost:3000`
- For production: `https://yourdomain.com`

## Security Notes

1. **Never commit your `.env` file** to version control
2. Add `.env` to your `.gitignore` file
3. Use different Client IDs for development and production
4. Regularly rotate your OAuth credentials
5. Monitor OAuth usage in Google Cloud Console

## Production Deployment

1. Create a new OAuth 2.0 Client ID for production
2. Add your production domain to Authorized JavaScript origins
3. Update your production environment variables
4. Test the OAuth flow in production before going live















