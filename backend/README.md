# Backend - Auth App

This backend service provides the REST API for user authentication including registration, OTP verification, login with OTP, and protected routes. It is built with **Node.js**, **Express**, **MongoDB** and uses **SendGrid** to send OTP verification emails.

---

## Features

- User registration with email and password
- OTP generation and email verification via SendGrid
- Resend OTP functionality
- Login with password and OTP verification for added security
- JWT based authentication and protected routes
- User logout functionality
- Password hashing with bcrypt
- Environment variable configuration with dotenv

---

## Prerequisites

- Node.js (v14 or above)
- MongoDB database (local or cloud)
- SendGrid account with API key

---

## Setup and Installation

1. Clone the repository and navigate to the `backend` folder.
2. Install dependencies:

   ```
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   SENDGRID_API_KEY=your_sendgrid_api_key
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server (development mode):

   ```
   npm run dev
   ```
5. The backend API will run on `http://localhost:5000` (or your specified PORT).

---

## API Endpoints

- `POST /api/register` - Register user and send OTP verification email
- `POST /api/verify-otp` - Verify user's OTP to activate account
- `POST /api/resend-otp` - Resend OTP for verification
- `POST /api/login` - Login user and send OTP for login verification
- `POST /api/match-otp` - Match OTP without verifying user (optional)
- `POST /api/logout` - User logout
- `GET /api/dashboard` - Protected route, returns user details (requires JWT token)

---

## Technologies Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- SendGrid Email Service
- bcryptjs for password hashing
- JSON Web Tokens (JWT) for authentication
- dotenv for configuration
