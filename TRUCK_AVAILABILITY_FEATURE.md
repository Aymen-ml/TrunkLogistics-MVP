# Truck Availability Checking Feature

## Overview
This feature prevents customers from booking trucks that are already rented or have active bookings. It provides real-time availability checking and clear visual indicators throughout the booking process.

## Implementation Date
October 20, 2025

## Backend Changes

### 1. New API Endpoint: `/api/trucks/:id/availability`
**Purpose:** Check if a truck is available for booking

**Method:** GET

**Authentication:** Required

**Query Parameters:**
- `rental_start_datetime` (optional): For rental equipment - start date/time of desired rental period
- `rental_end_datetime` (optional): For rental equipment - end date/time of desired rental period

**Response Format:**
```json
{
  "success": true,
  "data": {
    "available": true/false,
    "reason": "Reason if unavailable",
    "status": "active/inactive/rented/maintenance",
    "activeBookings": 0,
    "rental_start_datetime": "2025-10-20T10:00:00Z",
    "rental_end_datetime": "2025-10-22T10:00:00Z"
  }
}
```

**Logic:**
- **Transport Trucks:** Available if no active bookings (status not cancelled/completed)
- **Rental Equipment:** 
  - Without dates: Available if no active bookings
  - With dates: Checks for time period conflicts using `checkEquipmentAvailability()`

**Files Modified:**
- `server/src/controllers/truckController.js` - Added `checkTruckAvailability` controller
- `server/src/routes/trucks.js` - Added route for availability endpoint

### 2. Enhanced Truck Queries
**Feature:** Include `active_bookings_count` in truck search results

**Files Modified:**
- `server/src/models/TruckFixed.js` - Added subquery to count active bookings:
  ```sql
  COALESCE(
    (SELECT COUNT(*) 
     FROM bookings b 
     WHERE b.truck_id = t.id 
     AND b.status NOT IN ('cancelled', 'completed')), 
    0
  ) as active_bookings_count
  ```

**Benefit:** Allows frontend to display availability status without additional API calls

### 3. Improved Error Messages
**Purpose:** Provide clear, user-friendly error messages when booking unavailable trucks

**Files Modified:**
- `server/src/controllers/bookingController.js`

**Enhanced Messages:**
- **Inactive Truck:** "Unable to book this truck/equipment. This truck/equipment is currently marked as 'inactive' and is not accepting new bookings. Please choose another option or contact support for assistance."
- **Active Booking (Transport):** "Truck is currently unavailable. This truck already has an active booking and cannot accept new requests at this time. Please select a different truck or try again later."
- **Date Conflict (Rental):** "Equipment is not available for the selected dates. This equipment is already booked during your requested time period. Please select different dates or choose another piece of equipment."

**Response Structure:**
```json
{
  "success": false,
  "error": "Short error message",
  "message": "Detailed user-friendly explanation",
  "unavailable": true
}
```

## Frontend Changes

### 1. Real-Time Availability Checking (BookingForm)
**Feature:** Automatically check truck availability when truck or dates are selected

**Files Modified:**
- `client/src/components/bookings/BookingForm.jsx`

**New State Variables:**
```javascript
const [availability, setAvailability] = useState(null);
const [checkingAvailability, setCheckingAvailability] = useState(false);
```

**New Function:**
```javascript
const checkTruckAvailability = async (truckId, startDatetime = null, endDatetime = null)
```

**Triggers:**
- When truck is selected from dropdown
- When rental dates are changed (for rental equipment)

**Validation:**
- Form validation checks `availability.available` before allowing submission
- Shows error if truck is unavailable

### 2. Availability Status Indicator
**Feature:** Visual feedback showing if selected truck is available

**Implementation:**
- Displays below truck selection dropdown
- Three states:
  1. **Checking:** Shows spinning clock icon with "Checking availability..."
  2. **Available:** Green checkmark with "This truck/equipment is available"
  3. **Unavailable:** Red alert icon with reason for unavailability

**Icons Used:**
- `Clock` - Checking state (animated spin)
- `CheckCircle` - Available (green)
- `AlertCircle` - Unavailable (red)

### 3. Availability Badges in Search Results
**Feature:** Show availability status on each truck card in search results

**Files Modified:**
- `client/src/components/trucks/TruckSearch.jsx`

**Badge Display:**
```jsx
{truck.active_bookings_count !== undefined && (
  truck.active_bookings_count === 0 ? (
    <span className="...bg-green-100 text-green-800">
      Available
    </span>
  ) : (
    <span className="...bg-red-100 text-red-800">
      Rented
    </span>
  )
)}
```

**Benefits:**
- Customers can see availability at a glance
- Reduces time spent trying to book unavailable trucks
- Improves user experience

### 4. Enhanced Error Handling
**Feature:** Display detailed error messages from backend

**Files Modified:**
- `client/src/components/bookings/BookingForm.jsx`

**Logic:**
```javascript
if (errorData.unavailable) {
  setErrors({ 
    truck_id: errorData.message || errorData.error,
    general: errorData.message || errorData.error
  });
} else if (errorData.error) {
  const errorMessage = errorData.message || errorData.error;
  setErrors({ general: errorMessage });
}
```

**Display:**
- Field-specific errors shown below truck selection
- General errors shown in form error section
- Red text and styling to draw attention

## User Experience Flow

### For Transport Trucks
1. Customer views truck list - sees "Available" or "Rented" badge
2. Customer selects truck in booking form
3. System automatically checks availability
4. Shows green checkmark if available
5. If unavailable, shows red alert with reason
6. Form prevents submission if truck is unavailable

### For Rental Equipment
1. Customer views equipment list - sees availability badge
2. Customer selects equipment and enters dates
3. System checks availability for that specific time period
4. Shows real-time feedback as dates change
5. Prevents booking if equipment is unavailable for selected dates
6. Clear error message explains date conflict

## Technical Benefits

1. **Prevents Double-Booking:**
   - Backend validation ensures no conflicts
   - Real-time checking reduces failed submissions

2. **Better User Experience:**
   - Immediate feedback on availability
   - Clear error messages explain issues
   - Visual indicators throughout the flow

3. **Reduced Server Load:**
   - Include availability count in search queries
   - Prevent unnecessary booking attempts

4. **Scalable Design:**
   - Works for both transport and rental services
   - Date-based conflict detection for rentals
   - Simple active booking count for transport

## Database Impact

**Query Added:** Subquery in truck search to count active bookings
```sql
SELECT COUNT(*) 
FROM bookings b 
WHERE b.truck_id = t.id 
AND b.status NOT IN ('cancelled', 'completed')
```

**Performance Consideration:**
- Subquery runs per truck in results
- Indexed on `bookings.truck_id` and `bookings.status`
- Minimal impact for typical result sets (10-50 trucks)

## Testing Recommendations

1. **Transport Truck Availability:**
   - Book a truck (status: pending/in_progress)
   - Verify it shows "Rented" badge
   - Try to book same truck - should see error
   - Cancel/complete booking
   - Verify it shows "Available" badge

2. **Rental Equipment Availability:**
   - Book equipment for Oct 25-27
   - Try to book same equipment for Oct 26-28 (overlap)
   - Should show unavailable with date conflict message
   - Try to book for Oct 28-30 (no overlap)
   - Should allow booking

3. **Error Messages:**
   - Try booking inactive truck - verify friendly error
   - Try booking with active booking - verify clear message
   - Check that errors display properly in form

4. **UI Indicators:**
   - Verify badges show in search results
   - Verify availability checker in booking form
   - Check loading state while checking
   - Confirm icons and colors are correct

## Future Enhancements

1. **Calendar View:** Visual calendar showing availability for rental equipment
2. **Partial Availability:** Show available dates when selected dates conflict
3. **Availability Filter:** Filter search results to show only available trucks
4. **Notification:** Alert providers when their truck becomes available again
5. **Bulk Availability:** Check multiple trucks at once
6. **Booking Queue:** Allow customers to join waitlist for unavailable trucks

## Files Changed Summary

### Backend (5 files)
1. `server/src/controllers/truckController.js` - Added availability check controller
2. `server/src/routes/trucks.js` - Added availability route
3. `server/src/models/TruckFixed.js` - Added active_bookings_count to queries
4. `server/src/controllers/bookingController.js` - Enhanced error messages

### Frontend (2 files)
1. `client/src/components/bookings/BookingForm.jsx` - Added availability checking
2. `client/src/components/trucks/TruckSearch.jsx` - Added availability badges

## Commit Information
**Commit Hash:** 3c0d689
**Commit Message:** "Add truck availability checking feature"
**Date:** October 20, 2025

## Related Features
- Booking creation/management
- Truck search and filtering
- Status update system
- Document verification

## Documentation
- API documentation updated with new endpoint
- User guide includes availability feature
- Admin guide explains availability logic
