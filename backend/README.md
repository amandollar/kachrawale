# 🛠️ Kachrawale Backend Documentation

## Overview
Kachrawale Backend is a RESTful API built with **Node.js, Express, and MongoDB**. It manages users (Citizens/Collectors), waste pickups, marketplace rates, and real-time location streaming via Socket.io.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas URI)

### Installation
1.  Navigate to `backend/`.
2.  Install dependencies: `npm install`
3.  Set up `.env`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/kachrawale
    JWT_SECRET=your_secret_key
    CLIENT_URL=http://localhost:5173
    ```
4.  Run server: `npm run dev`

---

## 📂 Project Structure

```bash
backend/
├── src/
│   ├── config/         # DB connection (db.js)
│   ├── models/         # Mongoose Schemas (User, Pickup, WasteRate)
│   ├── routes/         # API Route definitions
│   ├── middleware/     # Auth & Error handling
│   ├── controllers/    # Logic for routes (optional, code currently in routes)
│   └── utils/          # Helper functions
├── server.js           # Entry point & Socket.io setup
```

---

## 🔐 Authentication
**JWT (JSON Web Tokens)** are used for security.
- **Header**: `Authorization: Bearer <token>`
- **Roles**: `citizen`, `collector`, `admin`

### Endpoints
- `POST /api/auth/register` - Create new account. (Collectors require vehicle details).
- `POST /api/auth/login` - Authenticate and receive Token.
- `GET /api/auth/me` - Get current user profile.

---

## 🚛 Pickups API
Core logic for waste collection.

### Endpoints
- `POST /api/pickups` - (Citizen) Schedule a pickup.
- `GET /api/pickups` - Get all pickups (Filtered by Role).
- `PUT /api/pickups/:id/status` - (Collector) Update status.
    - **Statuses**: `CREATED` -> `ACCEPTED` -> `ON_THE_WAY` -> `COMPLETED`.

### Schema (Pickup.js)
- **wasteType**: Enum (plastic, metal, etc.)
- **weight**: Estimated kg.
- **images**: Proof of waste.
- **location**: GeoJSON point (coordinates).
- **status**: Current state of the job.

---

## 🌍 Real-Time Events (Socket.io)
The server acts as a relay for live updates.

### Events Emitted
- `pickup_status_updated`: Sent when status changes (e.g., "ON_THE_WAY").
- `location_updated`: Broadcasts Collector's GPS coordinates for Live Map.
- `new_pickup`: Alert collectors when a new job is created.

### Events Listened To
- `update_location`: Collectors send `{ pickupId, lat, lng }` here.

---

## 💰 Admin & Rates
- `GET /api/rates` - Fetch current scrap market rates (Plastic: ₹12/kg).
- `POST /api/admin/verify-collector` - Approve pending collector accounts.
