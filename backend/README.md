# Setcore Backend API

Node.js backend API for Setcore task management application with user authentication.

## Features

- User registration and login
- JWT-based authentication
- MySQL database integration
- Password hashing with bcrypt
- Input validation
- Rate limiting
- CORS support
- Helmet security middleware

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your database credentials and other settings.

4. Create the database and tables:
```bash
mysql -u root -p < database/schema.sql
```

### Running the Application

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

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/verify` - Verify JWT token (protected)

### Health Check

- `GET /api/health` - API health check

## Environment Variables

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=setcore_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // validation errors (if applicable)
  ]
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- Helmet security middleware
- Input validation and sanitization
- CORS configuration