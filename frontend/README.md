# 🎨 Kachrawale Frontend Documentation

## Overview
The Kachrawale Frontend is a **React.js** application built with **Vite**. It provides a responsive interface for Citizens to schedule pickups and Collectors to manage them.

## 🛠️ Tech Stack
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet (via `react-leaflet`)
- **State Management**: Context API (`AuthContext`, `SocketContext`)
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📂 Project Structure

```bash
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Main navigation
│   │   ├── PickupList.jsx  # Lists pickups (Citizen/Collector variant)
│   │   ├── PickupDetailModal.jsx # Full details, map, & actions
│   │   ├── GPSTracker.jsx  # (Collector) Background GPS logic
│   │   └── LiveTrackingMap.jsx # (Citizen) Live map view
│   ├── pages/              # Route pages
│   │   ├── Dashboard.jsx   # Main user hub
│   │   ├── Login.jsx       # Auth
│   │   └── Register.jsx    # Signup
│   ├── context/            # Global state
│   │   ├── AuthContext.jsx # User session & token
│   │   └── SocketContext.jsx # Real-time connection
│   ├── utils/              # API helpers (Axios instance)
│   └── App.jsx             # Route definitions
```

---

## 🔑 Key Features & Logic

### 1. Authentication (`AuthContext`)
- Manages `user` state and `token` in localStorage.
- Auto-redirects to `/dashboard` upon login.
- Handles role-based access control (Citizen vs Collector).

### 2. Real-Time Updates (`SocketContext`)
- Connects to backend Socket.io server.
- Listens for:
    - `pickup_status_updated`: Refreshes dashboard list automatically.
    - `location_updated`: Updates the marker coordinates in `LiveTrackingMap`.

### 3. Dashboard (`Dashboard.jsx`)
- **Citizen View**:
    - "Schedule Pickup" button.
    - List of past/active pickups.
    - **Live Map**: Appears automatically when status is `ON_THE_WAY`.
- **Collector View**:
    - "Available Pickups" (Unassigned).
    - "My Pickups" (Assigned).
    - **GPS Tracker**: Auto-mounts when a pickup status is `ON_THE_WAY`.

### 4. Pickup Lifecycle (`PickupDetailModal.jsx`)
Collectors control the flow here:
- **Accept**: Assigns pickup to self.
- **Start Trip**: Emits `ON_THE_WAY`, enables GPS.
- **Complete**: Finishes job.

---

## 🏃 running Locally
1.  Navigate to `frontend/`.
2.  Install: `npm install`
3.  Run: `npm run dev`
4.  Open `http://localhost:5173`
