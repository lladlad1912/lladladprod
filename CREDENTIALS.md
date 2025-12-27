# User Credentials

This document contains the default user credentials for the Blog Application.

## ⚠️ Important Notes

- These users are **only created on first run** when the database is empty
- **Change all passwords in production!**
- For Google OAuth login, the email must match an existing user in the database

## Default Users

### 🔐 Admin User

**Full administrative access to all features**

- **Username:** `admin`
- **Email:** `admin@lladlad.com`
- **Password:** `Admin123!@`
- **Role:** `ADMIN`

**Permissions:**
- ✅ Create, update, delete users
- ✅ Create, update, delete categories
- ✅ Create, update, delete subcategories
- ✅ Create, update, delete any posts
- ✅ Manage site settings (social media links, contact email, footer)
- ✅ Manage ad placements
- ✅ View and manage contact submissions
- ✅ Access admin panel

---

### ✏️ Editor User

**Can create and manage their own posts**

- **Username:** `editor_user`
- **Email:** `editor@lladlad.com`
- **Password:** `Editor123!@`
- **Role:** `EDITOR`

**Permissions:**
- ✅ Create new posts
- ✅ Edit their own posts
- ✅ Upload images
- ✅ Add hashtags and SEO metadata
- ✅ Select subcategories for posts
- ✅ Use rich text editor (H1, H2, Bold, Italic, etc.)
- ✅ Write in Telugu language
- ✅ Comment on posts
- ✅ Like posts
- ✅ View all posts and categories
- ❌ Cannot delete posts (only admin can)
- ❌ Cannot edit other users' posts
- ❌ Cannot manage users, categories, or settings

---

### 👤 Regular User 1

**Standard user with viewing and interaction permissions**

- **Username:** `john_doe`
- **Email:** `john@example.com`
- **Password:** `Password123!@`
- **Role:** `USER`

**Permissions:**
- ✅ View all posts
- ✅ View categories
- ✅ Comment on posts
- ✅ Like posts
- ✅ View user profiles
- ❌ Cannot create or edit posts
- ❌ Cannot manage content

---

### 👤 Regular User 2

**Standard user with viewing and interaction permissions**

- **Username:** `jane_smith`
- **Email:** `jane@example.com`
- **Password:** `Pass123!@`
- **Role:** `USER`

**Permissions:**
- ✅ View all posts
- ✅ View categories
- ✅ Comment on posts
- ✅ Like posts
- ✅ View user profiles
- ❌ Cannot create or edit posts
- ❌ Cannot manage content

---

## Quick Login Reference

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | `admin` | `Admin123!@` | `admin@lladlad.com` |
| Editor | `editor_user` | `Editor123!@` | `editor@lladlad.com` |
| User | `john_doe` | `Password123!@` | `john@example.com` |
| User | `jane_smith` | `Pass123!@` | `jane@example.com` |

## Google OAuth Login

To use Google OAuth login, the email address must already exist in the database. The following emails are available for OAuth:

- `admin@lladlad.com` (Admin)
- `editor@lladlad.com` (Editor)
- `john@example.com` (User)
- `jane@example.com` (User)

## Creating New Users

### Via Admin Panel (Recommended)
1. Log in as admin
2. Navigate to "Users" in the sidebar
3. Click "Create User"
4. Fill in user details and select role

### Via API (Admin Only)
```bash
POST http://localhost:8080/api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePassword123!@",
  "role": "USER",
  "firstName": "New",
  "lastName": "User"
}
```

## Changing Passwords

### Via User Profile
1. Log in
2. Navigate to "Profile" in the sidebar
3. Click "Edit Profile"
4. Update password in the password field

### Via Admin Panel (Admin can change any user's password)
1. Log in as admin
2. Navigate to "Users"
3. Click "Edit" on the user
4. Update password

---

**Note:** These credentials are for development/testing purposes only. Always change default passwords in production environments!





















