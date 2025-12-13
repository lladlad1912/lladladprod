# How to Run the Application

## Quick Start Guide

### Option 1: Using H2 Database (Easiest - No MySQL Setup Required)

This uses the in-memory H2 database, perfect for testing and development.

#### Step 1: Start Backend

Open PowerShell in the project root and run:

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

Or in one command:
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

**Wait for:** `Started BlogApplication in X.XXX seconds`

#### Step 2: Start Frontend

Open a **new** PowerShell window and run:

```powershell
cd frontend
npm install
npm start
```

**Wait for:** Browser opens automatically at `http://localhost:3000`

---

### Option 2: Using MySQL Database (Production-like)

#### Prerequisites:
1. MySQL Server installed and running
2. Database created: `CREATE DATABASE blogdb;`
3. Update credentials in `application.properties` if needed

#### Step 1: Start Backend

```powershell
.\mvnw.cmd spring-boot:run
```

**Wait for:** `Started BlogApplication in X.XXX seconds`

#### Step 2: Start Frontend

Open a **new** PowerShell window:

```powershell
cd frontend
npm install
npm start
```

---

## Verification Steps

### Backend is Running:
1. Open browser: `http://localhost:8080/api/categories`
2. Should see JSON response (may be empty array `[]`)

### Frontend is Running:
1. Browser should open automatically at `http://localhost:3000`
2. You should see the Lladlad blog homepage

### Test Login:
1. Click "Login" in navbar
2. Use default admin credentials:
   - Username: `admin`
   - Password: `admin123`

---

## Troubleshooting

### Backend Won't Start

**Error: "Port 8080 already in use"**
- Another application is using port 8080
- Solution: Stop that application or change port in `application.properties`

**Error: "Cannot connect to MySQL"**
- MySQL server not running
- Solution: Start MySQL service or use H2 (dev profile)

**Error: "Database 'blogdb' doesn't exist"**
- Solution: Create database: `CREATE DATABASE blogdb;`

### Frontend Won't Start

**Error: "Port 3000 already in use"**
- Another React app is running
- Solution: Stop it or use different port: `PORT=3001 npm start`

**Error: "Module not found"**
- Dependencies not installed
- Solution: Run `npm install` in frontend directory

**Error: "Cannot connect to backend"**
- Backend not running
- Solution: Start backend first (see Step 1)

### Common Issues

**CORS Errors:**
- Backend not running or wrong URL
- Check: `http://localhost:8080/api/categories` works

**401 Unauthorized:**
- Token expired or invalid
- Solution: Logout and login again

**Blank Page:**
- Check browser console (F12) for errors
- Check if backend is running
- Check network tab for failed requests

---

## Default Users

After first run, these users are created automatically:

- **Admin:**
  - Username: `admin`
  - Password: `admin123`
  - Role: ADMIN

- **Regular Users:**
  - Username: `john_doe`
  - Password: `password123`
  - Role: USER

  - Username: `jane_smith`
  - Password: `password123`
  - Role: USER

---

## Development Tips

### Hot Reload
- **Backend**: Changes require restart (or use Spring DevTools)
- **Frontend**: Changes auto-reload in browser

### Database Access (H2)
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:blogdb`
- Username: `sa`
- Password: (leave empty)

### API Testing
- Use browser: `http://localhost:8080/api/posts`
- Use Postman or curl
- Check Network tab in browser DevTools

---

## Stopping the Application

### Backend:
- Press `Ctrl + C` in the terminal

### Frontend:
- Press `Ctrl + C` in the terminal
- Or close the terminal window

---

## Next Steps

1. ✅ Backend running on `http://localhost:8080`
2. ✅ Frontend running on `http://localhost:3000`
3. ✅ Login with admin credentials
4. ✅ Create categories
5. ✅ Create posts
6. ✅ Test comments and likes
7. ✅ Explore all features!

Happy coding! 🚀














