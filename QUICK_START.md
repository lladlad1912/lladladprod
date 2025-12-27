# Quick Start Guide

## Running the Application Without Installing Maven

I've added a **Maven Wrapper** to the project, so you don't need to install Maven separately!

### Step 1: Start the Backend

Open PowerShell or Command Prompt in the project directory and run:

```powershell
.\mvnw.cmd spring-boot:run
```

**Note:** The first time you run this, it will download Maven automatically (one-time download).

The backend will start on `http://localhost:8080`

### Step 2: Start the Frontend

Open a **new** terminal window, navigate to the frontend folder, and run:

```powershell
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### That's it! 🎉

Open your browser and go to `http://localhost:3000` to see the application.

---

## Alternative: Install Maven (Optional)

If you prefer to install Maven globally:

1. **Download Maven:**
   - Go to https://maven.apache.org/download.cgi
   - Download the latest `apache-maven-*-bin.zip`
   - Extract it to a folder (e.g., `C:\Program Files\Apache\maven`)

2. **Set Environment Variables:**
   - Open "Environment Variables" in Windows
   - Add new System Variable:
     - Name: `MAVEN_HOME`
     - Value: `C:\Program Files\Apache\maven\apache-maven-3.9.6` (your Maven path)
   - Edit `Path` variable and add: `%MAVEN_HOME%\bin`

3. **Verify Installation:**
   ```powershell
   mvn -version
   ```

4. **Then use:**
   ```powershell
   mvn spring-boot:run
   ```

---

## Troubleshooting

### "JAVA_HOME is not set"
- Make sure Java 17+ is installed
- Set `JAVA_HOME` environment variable to your JDK path
- Example: `C:\Program Files\Java\jdk-17`

### "mvnw.cmd is not recognized"
- Make sure you're in the project root directory
- Use `.\mvnw.cmd` (with the `.\` prefix) in PowerShell
- Or use `mvnw.cmd` directly in Command Prompt

### Port 8080 already in use
- Change the port in `src/main/resources/application.properties`
- Set `server.port=8081` (or any available port)
- Update frontend API URL in `frontend/src/services/api.js` accordingly



























