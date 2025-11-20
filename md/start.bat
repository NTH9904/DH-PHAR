@echo off
echo ========================================
echo   DH Pharmacy - Starting Server
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo Creating .env file from template...
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo MONGODB_URI=mongodb://localhost:27017/dh-pharmacy
        echo JWT_SECRET=dh-pharmacy-secret-key-change-in-production
        echo JWT_EXPIRE=7d
    ) > .env
    echo .env file created!
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if MongoDB is needed
echo Checking MongoDB connection...
echo.

REM Start server
echo Starting server...
echo.
echo Server will be available at:
echo   - Frontend: http://localhost:3000/pages/index.html
echo   - Admin: http://localhost:3000/admin/pages/dashboard.html
echo   - API: http://localhost:3000/api
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

pause

