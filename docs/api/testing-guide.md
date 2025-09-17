# API Testing Guide - TrunkLogistics

## Prerequisites

1. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=trunklogistics
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_here
   ```

2. **Database Setup**
   ```bash
   # Run migrations
   cd server
   node src/database/migrate.js
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

## Complete Booking Workflow Test

### Step 1: Register Users

**Register Customer:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Customer",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

**Register Provider:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@test.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Provider",
    "phone": "+1234567891",
    "role": "provider"
  }'
```

**Register Admin:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User",
    "phone": "+1234567892",
    "role": "admin"
  }'
```

### Step 2: Login and Get Tokens

**Customer Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```
Save the returned `token` as `CUSTOMER_TOKEN`.

**Provider Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "provider@test.com",
    "password": "password123"
  }'
```
Save the returned `token` as `PROVIDER_TOKEN`.

**Admin Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'
```
Save the returned `token` as `ADMIN_TOKEN`.

### Step 3: Create Profiles

**Create Customer Profile:**
```bash
curl -X POST http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "companyName": "ABC Logistics",
    "address": "123 Main St",
    "city": "New York",
    "country": "USA",
    "postalCode": "10001"
  }'
```

**Create Provider Profile:**
```bash
curl -X POST http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "companyName": "XYZ Transport",
    "businessLicense": "BL123456",
    "address": "456 Transport Ave",
    "city": "Los Angeles",
    "country": "USA",
    "postalCode": "90001"
  }'
```

### Step 4: Admin Verifies Provider

```bash
# First, get the provider profile ID from the previous response, then:
curl -X PUT http://localhost:5000/api/users/providers/{PROVIDER_PROFILE_ID}/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "verification_status": "approved"
  }'
```

### Step 5: Provider Creates Truck

```bash
curl -X POST http://localhost:5000/api/trucks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "truckType": "container",
    "capacity": 25000,
    "pricePerKm": 2.5,
    "description": "40ft Container Truck",
    "currentCity": "Los Angeles",
    "currentCountry": "USA"
  }'
```
Save the returned truck `id` as `TRUCK_ID`.

### Step 6: Customer Creates Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "truckId": "TRUCK_ID",
    "pickupAddress": "123 Pickup St",
    "pickupCity": "Los Angeles",
    "destinationAddress": "456 Delivery Ave",
    "destinationCity": "San Francisco",
    "pickupDate": "2024-09-01",
    "pickupTime": "09:00",
    "cargoDescription": "Electronics equipment",
    "cargoWeight": 5000,
    "cargoVolume": 50,
    "notes": "Handle with care"
  }'
```
Save the returned booking `id` as `BOOKING_ID`.

### Step 7: Test Booking Status Workflow

**Admin Approves Booking:**
```bash
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "approved",
    "notes": "Booking approved by admin"
  }'
```

**Provider Confirms Booking:**
```bash
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "status": "confirmed",
    "notes": "Truck assigned and ready"
  }'
```

**Provider Updates to In Transit:**
```bash
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "status": "in_transit",
    "notes": "Cargo picked up, en route to destination"
  }'
```

**Provider Completes Booking:**
```bash
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "status": "completed",
    "notes": "Cargo delivered successfully"
  }'
```

### Step 8: Verify Booking Details

**Get Booking with Status History:**
```bash
curl -X GET http://localhost:5000/api/bookings/$BOOKING_ID \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Get All Bookings (Customer View):**
```bash
curl -X GET http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Get Booking Statistics (Admin):**
```bash
curl -X GET http://localhost:5000/api/bookings/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Additional Test Scenarios

### Test Search and Filtering

**Search Trucks:**
```bash
curl -X GET "http://localhost:5000/api/trucks/search?truckType=container&pickupCity=Los Angeles&minCapacity=20000" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

**Filter Bookings:**
```bash
curl -X GET "http://localhost:5000/api/bookings?status=completed&page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test Error Scenarios

**Invalid Status Transition:**
```bash
# Try to set completed status directly from pending
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROVIDER_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

**Unauthorized Access:**
```bash
# Customer trying to approve booking
curl -X PUT http://localhost:5000/api/bookings/$BOOKING_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "status": "approved"
  }'
```

## Expected Response Format

All API responses follow this format:
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Success/error message",
  "error": "Error details (if any)"
}
```

## Testing Tools

### Using Postman
1. Import the API endpoints as a collection
2. Set up environment variables for tokens
3. Create test sequences for the complete workflow

### Using Insomnia
1. Create a workspace for TrunkLogistics
2. Set up base URL and authentication
3. Test the complete booking flow

### Automated Testing
Consider implementing:
- Unit tests for models and controllers
- Integration tests for API endpoints
- End-to-end tests for complete workflows
