# ♻️ Kachrawale - Modern Waste Management System

Kachrawale is a premium web application designed to bridge the gap between citizens and waste collectors. It streamlines waste disposal with real-time tracking, transparent pricing, and seamless payments.

## 🚀 Features

### 👨‍👩‍👧 For Citizens
- **Smart Scheduling**: Schedule waste pickups with images and video verification.
- **GPS Precision**: Pin your exact location for accurate collection.
- **Transparency**: View live market rates for different waste types.
- **Track Status**: Real-time updates as your pickup moves from assigned to completed.

### 🚛 For Collectors
- **Interactive Dashboard**: View and accept nearby pickup requests.
- **Live Navigation**: Use the built-in tracking map to reach citizens efficiently.
- **On-the-Spot Payments**: Calculate final amounts based on verified weight and accept payments via UPI or Cash.

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Real-time**: Socket.io for live location tracking and status updates.

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on .env.example
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
# Create a .env file based on .env.example
npm run dev
```

## 🔑 User Roles

To test the application, you can use the following roles:
- **Citizen**: Schedules pickups.
- **Collector**: Accepts and completes pickups.
- **Admin**: Manages rates and system settings.

## 🧪 Testing Guide

To test the full lifecycle of the app, follow these steps:

### 1. Test as a Citizen
1. **Register/Login** as a Citizen.
2. Go to the **Dashboard**.
3. Fill out the **Schedule a Pickup** form:
    - Select waste type and weight.
    - Upload an image (and video if required).
    - Click **Pin My Location** (Allow browser location access).
4. Click **Schedule Pickup**. Your request will appear in the list as `CREATED`.

### 2. Test as a Collector
1. **Register/Login** as a Collector in a **different browser/incognito window**.
2. On the **Dashboard**, you will see the Citizen's request.
3. Click **Accept**. The status changes to `ACCEPTED`.
4. Click **Start Trip**. Status changes to `ON_THE_WAY`. (Live tracking becomes active).
5. Click **Complete Pickup**:
    - Enter the **Verified Weight**.
    - The price will calculate automatically based on live rates.
    - Select **UPI** or **Cash** and click **Confirm**.
6. The pickup is now `COMPLETED`.

---

## 🔐 Admin Configuration (Manual)

If you need to access the Admin Panel to manage rates, you must manually promote a user in the database.

### Using MongoDB Compass / Shell:
1. Open your MongoDB tool and connect to the `kachrawale` database.
2. Open the `users` collection.
3. Find the user you want to promote and update their `role` field:
   ```json
   { "role": "admin" }
   ```
4. **Restart the Frontend/Login again** to see the **Admin** link in the Navbar.

### Using a Script (Quick Way):
Create a file named `make_admin.js` in the `backend` folder:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

const promote = async (email) => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.collection('users').updateOne(
        { email: email },
        { $set: { role: 'admin' } }
    );
    console.log(`User ${email} is now an Admin`);
    process.exit(0);
};

promote('your-email@example.com');
```
Run it with: `node make_admin.js`

---
Made with ❤️ by the Kachrawale Team.
