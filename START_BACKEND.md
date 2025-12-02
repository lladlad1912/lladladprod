# How to Start the Backend

## Option 1: Using H2 Database (Easiest - No Setup Required)

Run with dev profile:
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

Or set environment variable:
```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
.\mvnw.cmd spring-boot:run
```

## Option 2: Using MySQL (Production - Default)

### Prerequisites:
1. Install MySQL (8.0 or higher recommended)
2. Create database:
   ```sql
   CREATE DATABASE blogdb;
   ```

3. Update `application.properties` with your credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/blogdb?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

4. Run:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

## Option 3: Using IntelliJ IDEA / Eclipse

1. Right-click on `BlogApplication.java`
2. Select "Run" or "Debug"
3. The application will start automatically

## Verify Backend is Running

Once started, you should see:
```
Started BlogApplication in X.XXX seconds
```

Test the API:
- Open browser: `http://localhost:8080/api/categories`
- Should return JSON with categories

## Default Users Created

- **Admin**: username=`admin`, password=`admin123`
- **User 1**: username=`john_doe`, password=`password123`
- **User 2**: username=`jane_smith`, password=`password123`



