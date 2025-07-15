# NestJS Authentication System

A production-ready authentication system built with NestJS, GraphQL, and PostgreSQL. This project implements secure user registration, email verification, JWT-based authentication, and role-based access control.

## Features

- User registration with email verification
- JWT tokens stored in secure HTTP-only cookies
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Password updates with current password verification
- Secure logout functionality
- GraphQL API with proper error handling

## Tech Stack

- **Backend**: NestJS, TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT, Passport.js
- **API**: GraphQL with Apollo Server
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/rosahadi/nestjs-auth
cd nestjs-auth
```

2. Install dependencies
```bash
npm install
```

3. Start the PostgreSQL database
```bash
docker-compose up -d
```

4. Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=nestjs_auth_db
DB_SYNC=1

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=60m
JWT_COOKIE_EXPIRES_IN=7

NODE_ENV=development
```

5. Start the development server
```bash
npm run start:dev
```

The GraphQL playground will be available at `http://localhost:3000/graphql`

## Security Features

- **HTTP-only cookies**: JWT tokens are stored in secure cookies that can't be accessed by JavaScript
- **Password hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Email verification**: Users must verify their email before accessing protected resources
- **Role-based access**: Different permission levels for users and administrators
- **Input validation**: All inputs are validated using class-validator decorators
- **Error handling**: Consistent error messages that don't leak sensitive information

## Development Notes

- The database synchronization is enabled in development but should be disabled in production
- Email verification tokens are currently logged to the console - integrate with a real email service for production
- All GraphQL operations require authentication by default unless marked with `@Public()`
- The system automatically cleans up expired unverified user accounts

## Production Considerations

Before deploying to production:

1. Set up a proper email service (SendGrid, AWS SES, etc.)
2. Disable database synchronization and use proper migrations
3. Use environment-specific configuration files
4. Set up proper logging and monitoring
5. Consider implementing rate limiting for authentication endpoints

## Tutorial Series

This project is accompanied by a comprehensive tutorial series:

- [Part 1: Foundation Setup](https://dev.to/rosahadi/nestjs-authentication-tutorial-part-1-foundation-setup-1897)
- [Part 2: JWT Authentication & Email Verification](https://dev.to/rosahadi/nestjs-authentication-tutorial-part-2-jwt-authentication-email-verification-ike)

These tutorials provide step-by-step guidance on building this authentication system from scratch.

## License

This project is licensed under the MIT License.
