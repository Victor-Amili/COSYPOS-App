# COSYPOS Firebase Backend

Complete Firebase backend for the COSYPOS Restaurant POS system.

## Project Structure

```
cosypos/
├── src/
│   ├── firebase/
│   │   └── config.js          # Firebase initialization
│   ├── services/
│   │   ├── authService.js     # Authentication
│   │   ├── userService.js     # Staff/Users CRUD
│   │   ├── productService.js  # Products & Categories
│   │   ├── orderService.js    # Orders & Payments
│   │   ├── tableService.js    # Table management
│   │   ├── reservationService.js  # Reservations
│   │   ├── attendanceService.js   # Staff attendance
│   │   ├── notificationService.js # Notifications
│   │   └── reportService.js   # Reports & analytics
│   ├── hooks/
│   │   ├── useAuth.js         # Auth state & role checking
│   │   ├── usePermissions.js  # Role-based permissions
│   │   └── useRealtime.js     # Firestore real-time listeners
│   └── components/
│       └── ProtectedRoute.jsx # Route guards
├── functions/
│   ├── index.js               # Cloud Functions
│   └── package.json           # Functions dependencies
├── scripts/
│   └── seedData.js            # Initial data seeding
├── firestore.rules            # Security rules
├── firestore.indexes.json     # Query indexes
├── storage.rules              # Storage security rules
├── firebase.json              # Firebase config
└── .env                       # Environment variables
```

## Collections

| Collection | Purpose |
|------------|---------|
| `users` | Staff, admins, managers |
| `products` | Menu items + inventory |
| `categories` | Menu categories |
| `orders` | Customer orders |
| `tables` | Restaurant tables |
| `reservations` | Table reservations |
| `attendance` | Staff attendance |
| `notifications` | System notifications |
| `settings` | App configuration |

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Project
```bash
firebase init
```
Select: Firestore, Functions, Storage, Hosting

### 4. Install Dependencies
```bash
# Frontend
npm install firebase

# Functions
cd functions
npm install
```

### 5. Configure Environment Variables
Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 6. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 7. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 8. Seed Initial Data
```bash
node scripts/seedData.js
```

### 9. Start Development
```bash
npm run dev
```

## Authentication Flow

1. Admin creates users via `authService.signUpUser()`
2. Cloud Function `setCustomClaims` sets role in JWT token
3. Frontend `useAuth` hook listens to auth state
4. `usePermissions` hook checks role-based access
5. `ProtectedRoute` guards routes based on permissions

## Real-time Features

- Orders update in real-time for kitchen dashboard
- Table status changes reflect immediately
- Notifications appear without refresh
- Reservations sync across all clients

## Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `setCustomClaims` | HTTPS Callable | Set user roles |
| `syncUserRole` | Firestore onUpdate | Sync role changes |
| `updateInventoryOnOrderComplete` | Firestore onUpdate | Auto-update stock |
| `notifyNewOrder` | Firestore onCreate | Order notifications |
| `notifyOrderStatusChange` | Firestore onUpdate | Status notifications |
| `notifyNewReservation` | Firestore onCreate | Reservation notifications |
| `deleteUser` | HTTPS Callable | Delete user accounts |

## Security

- Firestore rules enforce role-based access
- Storage rules restrict image uploads
- Custom claims in JWT tokens for role verification
- Admin-only operations protected server-side

## Reports

All reports are computed from live data:
- **Dashboard**: Daily sales, monthly revenue, table occupancy
- **Reservation Report**: Status breakdown, date range filtering
- **Revenue Report**: Top selling items, profit margins
- **Staff Report**: Attendance rates, period summaries

## Next Steps

1. Connect frontend components to services
2. Add image upload to product/category forms
3. Implement real-time order tracking
4. Add date range filtering to reports
5. Set up email notifications (SendGrid/Resend)
