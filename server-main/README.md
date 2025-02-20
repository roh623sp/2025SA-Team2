# Fitness App Backend

A Node.js/Express backend for the fitness application with user authentication, profile management, and fitness tracking features.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Gmail account (for email notifications)

## Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd server-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Variables**
- Copy the `.env.example` file to `.env`
```bash
cp .env.example .env
```
- Update the variables in `.env` with your values

4. **Setting up Gmail App Password**

To use Gmail for sending emails (password reset, etc.), you need to create an App Password:

a. Go to your Google Account settings
b. Navigate to Security
c. Enable 2-Step Verification if not already enabled
d. Go to 'App passwords' (under 2-Step Verification)
e. Select 'Mail' and 'Other (Custom name)'
f. Enter a name for your app (e.g., "Fitness App")
g. Click Generate
h. Copy the 16-character password
i. Paste this password in your .env file as EMAIL_PASSWORD

5. **Database Setup**
- Make sure MongoDB is running locally or update MONGODB_URI with your MongoDB connection string
- The application will create necessary collections automatically

6. **Start the Server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### User Management
- `PATCH /api/users/profile` - Update user profile
- `PATCH /api/users/settings` - Update user settings
- `DELETE /api/users/account` - Delete user account

### Onboarding
- `POST /api/onboarding/submit` - Submit onboarding quiz
- `GET /api/onboarding/status` - Get onboarding status
- `PATCH /api/onboarding/update` - Update onboarding information

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security Features

- JWT-based authentication
- Password hashing using bcrypt
- Rate limiting on authentication endpoints
- Secure password reset flow
- Request validation
- XSS protection
- CORS configuration

## Development

### Code Structure
```
server-main/
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/        # Database models
├── routes/        # API routes
├── utils/         # Utility functions
├── .env           # Environment variables
└── index.js       # Application entry point
```

### Running Tests
```bash
npm test
```

## Production Deployment

1. Update environment variables for production
2. Set NODE_ENV=production
3. Configure proper security headers
4. Set up monitoring and logging
5. Use PM2 or similar process manager

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
```

