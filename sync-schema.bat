@echo off
:: Simple script to synchronize the GraphQL schema from backend to frontend

echo 🔄 Synchronizing GraphQL schema...
cd backend
python generate_schema.py
cd ../frontend
call npm run relay

echo ✅ Schema synchronized and Relay artifacts generated
echo 📊 You can now start the application with:
echo    - Backend: cd backend ^&^& python app.py
echo    - Frontend: cd frontend ^&^& npm start 