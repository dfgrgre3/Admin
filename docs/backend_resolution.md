# Troubleshooting: "Failed to connect to authentication service"

## 🔍 Root Cause Analysis
The frontend application was throwing the `"Failed to connect to authentication service"` error because the Next.js API proxy catch-all was attempting to forward auth requests to the Go API backend on port `8082` (as configured by `NEXT_PUBLIC_API_URL` and `INTERNAL_API_URL` in `.env`), but the Go backend was not running. 

## 🛠️ Resolution Steps

1. **Located the Go Backend**: Found the Go backend project at `D:\thanawy\backend`.
2. **Checked Config & Environment**: Verified that the backend `.env` matches the expected setup (`PORT=8082` and pointing to the local Postgres database `thanawy` and local Redis instance).
3. **Launched the Service**: Started the precompiled Go backend executable `backend.exe` with its working directory set to `D:\thanawy\backend` so it could correctly pick up its `.env` config.
4. **Output redirection**: Directed stdout and stderr to `backend.log` and `backend_err.log` inside the workspace `d:\admin` for easy monitoring.

---

## 🚦 Verification Results

* **Port Check**:
  ```powershell
  netstat -ano | findstr "8082"
  # Output:
  # TCP    0.0.0.0:8082           0.0.0.0:0              LISTENING       18112
  ```
  The Go backend is actively listening on port `8082`.

* **Backend Health Check**:
  ```powershell
  Invoke-RestMethod -Uri http://localhost:8082/health
  # Response:
  # status: UP
  ```
  The Go backend status is **UP** and all database/cache connections are successfully established.

* **Proxy Connection**:
  ```powershell
  Invoke-RestMethod -Uri http://localhost:3000/api/auth/me
  # Response:
  # Invoke-RestMethod : The remote server returned an error: (401) Unauthorized.
  ```
  The frontend proxy successfully communicates with the Go backend (returning `401 Unauthorized` as expected for a request without credentials, instead of a `502 Bad Gateway` error).

---

## 🏃 How to Run the Services in the Future

### 1. Start the Frontend
In your frontend directory (`d:\admin`), run:
```bash
npm run dev
```

### 2. Start the Backend
To start the Go backend server in the background (using the precompiled binary), run this in a PowerShell terminal:
```powershell
Start-Process -FilePath "D:\thanawy\backend\backend.exe" -WorkingDirectory "D:\thanawy\backend" -NoNewWindow -RedirectStandardOutput "D:\admin\backend.log" -RedirectStandardError "D:\admin\backend_err.log"
```

If you prefer to compile and run it from source, run:
```powershell
go run -C D:\thanawy\backend cmd/api/main.go
```
