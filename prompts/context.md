# TruckLogistics — MVP Feature Description

## 🎯 Goal
Build the first version of a web platform that connects customers (shippers) with logistics providers (truck owners/companies).  
The MVP focuses on the essential flow: customers can search and request trucks, providers can list and confirm bookings, and admins ensure basic compliance.

---

## 1. User Accounts & Roles

- **Customer**
  - Register, log in, manage simple profile.
  - Search trucks, place booking requests, and view orders.

- **Logistics Provider**
  - Register and create a provider profile.
  - Add/manage trucks with basic details (type, capacity, price).
  - Confirm bookings once approved.

- **Admin/Manager**
  - Review and approve or reject bookings.
  - Manage users and trucks (activate/deactivate).

---

## 2. Truck Listings (Basic)

- Providers can create truck profiles:
  - Truck type (flatbed, container, refrigerated, etc.).
  - Capacity (weight, volume).
  - Price (per km or fixed).
  - Assigned driver details (name + phone number).
- Simple status: Active / Inactive.

---

## 3. Search & Booking

- Customers search by:
  - Pickup & destination.
  - Date/time.
  - Truck type/capacity.
- Customers select a truck and submit a booking request.
- Order statuses:
  - Pending Review → Approved by Admin/Manager → Confirmed by Provider → Completed / Cancelled.

---

## 4. Orders & Payments

- Customers can see their bookings (pending, confirmed, completed).
- Providers see booking requests and confirmed trips.
- Admin sees all orders.
- Payments handled **offline in cash** (no online payment in MVP).

---

## 5. Notifications (Basic)

- Email or in-app notifications for:
  - Booking request.
  - Approval/denial.
  - Provider confirmation.

---

## 6. MVP Tech Stack (Lightweight)

- **Frontend**: React + TailwindCSS  
- **Backend**: Node.js (Express.js)  
- **Database**: PostgreSQL (structured data)  
- **Authentication**: JWT-based login  
- **Storage**: AWS S3 / local storage for images  
- **Notifications**: Basic email (SendGrid / Nodemailer)  

---

## 7. Database Schema

### Core Tables

#### **users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'provider', 'admin') NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **customer_profiles**
```sql
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **provider_profiles**
```sql
CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_verified BOOLEAN DEFAULT false,
    verification_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **trucks**
```sql
CREATE TABLE trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    truck_type ENUM('flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other') NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    capacity_weight DECIMAL(10,2) NOT NULL, -- in tons
    capacity_volume DECIMAL(10,2), -- in cubic meters
    price_per_km DECIMAL(10,2),
    fixed_price DECIMAL(10,2),
    pricing_type ENUM('per_km', 'fixed') NOT NULL,
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    year INTEGER,
    make VARCHAR(100),
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **drivers**
```sql
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **truck_drivers**
```sql
CREATE TABLE truck_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(truck_id, driver_id)
);
```

#### **bookings**
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_coordinates POINT,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_coordinates POINT,
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    estimated_distance DECIMAL(10,2), -- in km
    total_price DECIMAL(10,2),
    cargo_description TEXT,
    cargo_weight DECIMAL(10,2),
    cargo_volume DECIMAL(10,2),
    status ENUM('pending_review', 'approved', 'confirmed', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending_review',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **booking_status_history**
```sql
CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    status ENUM('pending_review', 'approved', 'confirmed', 'in_transit', 'completed', 'cancelled') NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **notifications**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type ENUM('booking_request', 'booking_approved', 'booking_confirmed', 'booking_cancelled') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_entity_type ENUM('booking', 'truck'),
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Booking searches
CREATE INDEX idx_bookings_pickup_city ON bookings(pickup_city);
CREATE INDEX idx_bookings_destination_city ON bookings(destination_city);
CREATE INDEX idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);

-- Truck searches
CREATE INDEX idx_trucks_provider_id ON trucks(provider_id);
CREATE INDEX idx_trucks_type ON trucks(truck_type);
CREATE INDEX idx_trucks_status ON trucks(status);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

---

## 8. Optimal Folder Structure

```
TruckLogistics/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Generic components
│   │   │   │   ├── Button/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Loading/
│   │   │   │   └── Layout/
│   │   │   ├── forms/               # Form components
│   │   │   │   ├── LoginForm/
│   │   │   │   ├── BookingForm/
│   │   │   │   └── TruckForm/
│   │   │   └── navigation/          # Navigation components
│   │   │       ├── Header/
│   │   │       ├── Sidebar/
│   │   │       └── Footer/
│   │   ├── pages/                   # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── customer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── SearchTrucks.jsx
│   │   │   │   ├── BookingHistory.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── provider/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TruckManagement.jsx
│   │   │   │   ├── BookingRequests.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── BookingApprovals.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       └── Profile.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useApi.js
│   │   │   └── useLocalStorage.js
│   │   ├── services/                # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   └── truckService.js
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.js
│   │   │   └── NotificationContext.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validation.js
│   │   ├── styles/                  # Global styles
│   │   │   ├── globals.css
│   │   │   └── tailwind.css
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.js
│   │   │   ├── jwt.js
│   │   │   ├── email.js
│   │   │   └── storage.js
│   │   ├── controllers/             # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── truckController.js
│   │   │   ├── bookingController.js
│   │   │   └── notificationController.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   ├── models/                  # Database models
│   │   │   ├── User.js
│   │   │   ├── Truck.js
│   │   │   ├── Booking.js
│   │   │   └── Notification.js
│   │   ├── routes/                  # API routes
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── trucks.js
│   │   │   ├── bookings.js
│   │   │   └── notifications.js
│   │   ├── services/                # Business logic
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── emailService.js
│   │   │   └── notificationService.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── logger.js
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   └── constants.js
│   │   ├── database/                # Database related
│   │   │   ├── migrations/
│   │   │   ├── seeders/
│   │   │   └── connection.js
│   │   └── app.js                   # Express app setup
│   ├── package.json
│   └── server.js                    # Entry point
│
├── shared/                          # Shared utilities/types
│   ├── constants/
│   │   ├── roles.js
│   │   ├── statuses.js
│   │   └── truckTypes.js
│   ├── types/
│   │   └── index.js
│   └── utils/
│       └── validation.js
│
├── docs/                           # Documentation
│   ├── api/                        # API documentation
│   │   ├── auth.md
│   │   ├── bookings.md
│   │   └── trucks.md
│   ├── deployment/                 # Deployment guides
│   │   ├── docker.md
│   │   └── production.md
│   └── README.md
│
├── tests/                          # Test files
│   ├── client/                     # Frontend tests
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── server/                     # Backend tests
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   └── e2e/                        # End-to-end tests
│
├── uploads/                        # File uploads (local storage)
│   ├── images/
│   └── temp/
│
├── scripts/                        # Build and deployment scripts
│   ├── build.sh
│   ├── deploy.sh
│   └── seed-db.js
│
├── .env.example                    # Environment variables template
├── .gitignore
├── docker-compose.yml              # Docker configuration
├── package.json                    # Root package.json
└── README.md                       # Project documentation
```

### Key Folder Structure Benefits:

1. **Separation of Concerns**: Clear separation between client, server, and shared code
2. **Scalability**: Organized structure that can grow with the application
3. **Maintainability**: Easy to locate and modify specific functionality
4. **Testing**: Dedicated test structure mirroring the application structure
5. **Documentation**: Comprehensive documentation organization
6. **Deployment**: Clear deployment and configuration management
