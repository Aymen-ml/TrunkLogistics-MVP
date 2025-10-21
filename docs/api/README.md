# TruckLogistics API Documentation

## Base URL
```
http://localhost:5000/api
```

## Health Check
```http
GET /api/health
```

Returns server status and environment information.

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

### Login User
```http
POST /api/auth/login
```

### Logout User
```http
POST /api/auth/logout
```

## User Management

### Get User Profile
```http
GET /api/users/profile
```

### Update User Profile
```http
PUT /api/users/profile
```

## Truck Management

### Search Trucks
```http
GET /api/trucks
```

### Create Truck Listing
```http
POST /api/trucks
```

### Get Truck Details
```http
GET /api/trucks/:id
```

### Update Truck
```http
PUT /api/trucks/:id
```

## Booking Management

### Get User's Bookings
```http
GET /api/bookings
```

### Create Booking Request
```http
POST /api/bookings
```

### Get Booking Details
```http
GET /api/bookings/:id
```

### Update Booking Status
```http
PUT /api/bookings/:id/status
```

## Notifications

### Get User's Notifications
```http
GET /api/notifications
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.
