# Backend Setup Guide

This guide will help you set up the backend server for the Travel Advisor application.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **npm** or **yarn**

## Setup Instructions

### 1. Install Backend Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp config.env.example .env
```

Edit the `.env` file and update the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/travel-advisor
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

**Important:** 
- For production, use a strong, random JWT_SECRET
- If using MongoDB Atlas, update MONGODB_URI with your connection string
- Example MongoDB Atlas URI: `mongodb+srv://username:password@cluster.mongodb.net/travel-advisor`

### 3. Start MongoDB

**Local MongoDB:**
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
mongod
```

**MongoDB Atlas:**
- No local installation needed
- Use your connection string in the `.env` file

### 4. Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in your `.env` file).

### 5. Configure Frontend

Update your frontend `.env` file (in the root directory) to include:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

If you don't have a `.env` file in the root, create one.

### 6. Test the API

You can test the API using the following endpoints:

**Health Check:**
```
GET http://localhost:5000/api/health
```

**Signup:**
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Request/Response Formats

#### Signup Request
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Signup Response (Success)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### Login Request
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login Response (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "User with this email already exists"
    }
  ]
}
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl status mongod
   ```

2. **Check MongoDB connection string:**
   - Verify the MONGODB_URI in your `.env` file
   - For MongoDB Atlas, ensure your IP is whitelisted
   - Check your username and password

### CORS Issues

If you encounter CORS errors, make sure:
1. The backend server is running
2. The frontend is configured to use the correct API URL
3. CORS is enabled in the backend (it's already configured)

### Port Already in Use

If port 5000 is already in use:
1. Change the PORT in your `.env` file
2. Update the VITE_API_BASE_URL in your frontend `.env` file

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Use environment variables** for all sensitive data
5. **Validate and sanitize** all user inputs
6. **Use rate limiting** for authentication endpoints
7. **Implement password reset** functionality
8. **Use secure password hashing** (bcrypt is already configured)

## Next Steps

1. Implement password reset functionality
2. Add email verification
3. Implement rate limiting
4. Add request logging
5. Set up error monitoring
6. Add API documentation (Swagger/OpenAPI)
7. Implement refresh tokens
8. Add social authentication (Google, Facebook)


