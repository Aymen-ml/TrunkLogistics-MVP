# TruckLogistics - MVP Platform

A web platform connecting customers (shippers) with logistics providers (truck owners/companies).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 13+

### Installation

1. **Clone and install dependencies:**
```bash
cd TruckLogistics
npm run install:all
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database and other configurations
```

3. **Set up database:**
```bash
# Create PostgreSQL database
createdb trunk_logistics

# Run migrations (when available)
npm run server:db:migrate

# Seed database (when available)
npm run server:db:seed
```

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
TruckLogistics/
├── client/          # React frontend (Vite + TailwindCSS)
├── server/          # Node.js backend (Express + PostgreSQL)
├── shared/          # Shared constants and utilities
├── docs/            # Documentation
├── tests/           # Test files
├── uploads/         # File uploads (local storage)
└── scripts/         # Build and deployment scripts
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Router
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT
- **File Storage**: Local storage (configurable to AWS S3)
- **Email**: SendGrid/Nodemailer

## 📊 Features

### User Roles
- **Customer**: Search trucks, place bookings, view orders
- **Provider**: Manage trucks, confirm bookings, manage drivers
- **Admin**: Manage users, view analytics, system configuration

### Core Functionality
- User authentication and role-based access
- Truck management and search
- Booking and order management
- Real-time notifications
- Responsive web interface

## 🔧 Development

### Available Scripts

**Root level:**
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run start` - Start production server
- `npm test` - Run all tests

**Client specific:**
- `npm run client:dev` - Start frontend development server
- `npm run client:build` - Build frontend for production

**Server specific:**
- `npm run server:dev` - Start backend development server
- `npm run server:start` - Start production backend server

### Environment Variables

Copy `.env.example` to `.env` and configure:

- Database connection (PostgreSQL)
- JWT secret for authentication
- Email service configuration
- File upload settings
- AWS S3 settings (optional)

## 🗄️ Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `trucks` - Truck listings and details
- `drivers` - Driver information
- `bookings` - Booking requests and orders
- `notifications` - System notifications

## 📝 API Endpoints

The backend provides RESTful API endpoints for all functionality:
- Authentication: `/api/auth`
- Users: `/api/users`
- Trucks: `/api/trucks`
- Bookings: `/api/bookings`
- Notifications: `/api/notifications`

Health check: `GET /api/health`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run client tests
npm run client:test

# Run server tests
npm run server:test
```

## 🚀 Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start the production server:
```bash
npm start
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
