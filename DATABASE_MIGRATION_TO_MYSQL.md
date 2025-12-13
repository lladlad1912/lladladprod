# Database Migration: PostgreSQL → MySQL

## ✅ Changes Completed

### 1. Maven Dependencies (`pom.xml`)
- ✅ Already had MySQL connector: `mysql-connector-j`
- ✅ H2 dependency retained for development profile

### 2. Application Properties (`application.properties`)
**Updated:**
```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/blogdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

**Key Changes:**
- Changed URL from PostgreSQL format to MySQL format
- Updated port from 5432 (PostgreSQL) to 3306 (MySQL)
- Added MySQL-specific connection parameters:
  - `useSSL=false` - Disable SSL for local development
  - `serverTimezone=UTC` - Set timezone to UTC
  - `allowPublicKeyRetrieval=true` - Allow public key retrieval for authentication

### 3. Documentation Updates
- ✅ Updated `README.md` - Changed references from PostgreSQL to MySQL
- ✅ Updated `BACKEND_FEATURES.md` - MySQL setup instructions
- ✅ Updated `START_BACKEND.md` - MySQL configuration
- ✅ Updated `STEP_BY_STEP_EXPLANATION.md` - Database migration section

## 🚀 Setup Instructions

### Prerequisites
1. Install MySQL Server (8.0 or higher recommended)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use package manager:
     - Windows: `choco install mysql`
     - macOS: `brew install mysql`
     - Linux: `sudo apt-get install mysql-server`

### Database Setup

1. **Start MySQL Server:**
   ```bash
   # Windows (if installed as service, it starts automatically)
   # Or use MySQL Workbench / Command Line
   
   # macOS/Linux
   sudo systemctl start mysql
   # or
   brew services start mysql
   ```

2. **Create Database:**
   ```sql
   mysql -u root -p
   ```
   Then run:
   ```sql
   CREATE DATABASE blogdb;
   USE blogdb;
   ```

3. **Update Credentials:**
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

4. **Run Application:**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

### Development Profile (H2)
If you want to use H2 for development (no MySQL setup needed):
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--spring.profiles.active=dev
```

## 📊 MySQL vs PostgreSQL Differences

### Connection URL Format
- **PostgreSQL**: `jdbc:postgresql://localhost:5432/blogdb`
- **MySQL**: `jdbc:mysql://localhost:3306/blogdb?useSSL=false&serverTimezone=UTC`

### Default Ports
- **PostgreSQL**: 5432
- **MySQL**: 3306

### Dialect
- **PostgreSQL**: `org.hibernate.dialect.PostgreSQLDialect`
- **MySQL**: `org.hibernate.dialect.MySQLDialect`

### Driver Class
- **PostgreSQL**: `org.postgresql.Driver`
- **MySQL**: `com.mysql.cj.jdbc.Driver`

## 🔧 Configuration Details

### Connection Parameters Explained

1. **useSSL=false**
   - Disables SSL for local development
   - For production, set to `true` and configure SSL certificates

2. **serverTimezone=UTC**
   - Sets the server timezone to UTC
   - Prevents timezone-related issues with timestamps

3. **allowPublicKeyRetrieval=true**
   - Allows retrieval of public key for authentication
   - Required for MySQL 8.0+ with `caching_sha2_password` authentication

### Production Configuration
For production, update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://your-host:3306/blogdb?useSSL=true&serverTimezone=UTC&requireSSL=true
spring.datasource.username=your_production_user
spring.datasource.password=your_secure_password
```

## ✅ Verification

After starting the application, verify MySQL connection:

1. **Check Logs:**
   Look for:
   ```
   HikariPool-1 - Starting...
   HikariPool-1 - Start completed.
   ```

2. **Test API:**
   ```bash
   curl http://localhost:8080/api/categories
   ```

3. **Check Database:**
   ```sql
   mysql -u root -p
   USE blogdb;
   SHOW TABLES;
   ```

## 📝 Notes

- All existing data models and relationships remain unchanged
- Hibernate will automatically create/update tables based on entities
- The `dev` profile still uses H2 for quick development
- MySQL 8.0+ is recommended for best compatibility

## 🎯 Next Steps

1. Create MySQL database: `CREATE DATABASE blogdb;`
2. Update credentials in `application.properties`
3. Run the application
4. Verify tables are created automatically
5. Test the application functionality

Migration complete! 🎉














