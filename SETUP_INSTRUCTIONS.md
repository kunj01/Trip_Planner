# Travel Advisor - Backend Setup Instructions

## Quick Start Guide

### 1. Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example file
   cp config.env.example .env
   ```
   
   Then edit `.env` and set:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/travel-advisor
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB:**
   - **Windows:** `net start MongoDB`
   - **macOS/Linux:** `sudo systemctl start mongod` or `mongod`
   - **MongoDB Atlas:** No local installation needed, just use your connection string

5. **Start the backend server:**
   ```bash
   npm run dev  # Development mode with auto-reload
   # or
   npm start    # Production mode
   ```

### 2. Frontend Setup

1. **Create `.env` file in root directory:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_TRAVEL_API_KEY=your_travel_api_key_here
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

### 3. Testing

1. **Backend should be running on:** `http://localhost:5000`
2. **Frontend should be running on:** `http://localhost:5173` (or port shown in terminal)
3. **Test the authentication:**
   - Go to `/signup` and create an account
   - Go to `/login` and login with your credentials
   - Check the navbar - you should see your name in the profile dropdown

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth token)

### Health Check
- `GET /api/health` - Check if server is running

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check your connection string in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### CORS Issues
- Make sure backend is running on port 5000
- Check that `VITE_API_BASE_URL` in frontend `.env` matches backend URL

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_API_BASE_URL` in frontend `.env` accordingly

## Features Implemented

✅ User Signup with validation
✅ User Login with JWT authentication
✅ Password hashing with bcrypt
✅ JWT token generation and verification
✅ Protected routes (GET /api/auth/me)
✅ AuthContext for frontend state management
✅ Persistent authentication (localStorage)
✅ Error handling and validation
✅ Beautiful UI for login/signup

## Next Steps (Optional)

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social authentication (Google, Facebook)
- [ ] Profile management
- [ ] Protected routes in frontend
- [ ] Remember me functionality
- [ ] Rate limiting
- [ ] Refresh tokens


