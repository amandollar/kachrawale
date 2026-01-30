# Clean & Green ♻️

**Clean & Green** is a modern, real-time waste management platform connecting citizens, waste collectors, and administrators. It streamlines the recycling process through live tracking, instant communication, and transparent pricing.

![Project Status](https://img.shields.io/badge/status-active-emerald)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

### 👤 For Citizens
- **Schedule Pickups**: Easily request waste collection for various categories (Plastic, Metal, E-Waste, etc.).
- **Real-Time Tracking**: Track your assigned collector's location live on the map.
- **Instant Chat**: Communicate directly with collectors or support via the in-app chat.
- **Digital Payments**: Secure and transparent payment handling.

### 🚛 For Collectors
- **Job Dashboard**: View available pickup requests in your vicinity (Geospatial matching).
- **Navigation**: optimizing routes to pickup locations.
- **Earnings**: Track completed jobs and daily earnings.
- **Verification**: Secure onboarding and document verification process.

### 🛡️ For Admins
- **Operations Center**: Monitor all system activity, pickups, and user stats.
- **Rate Management**: Update market rates for different waste types dynamically.
- **Support Desk**: Centralized chat interface to handle user inquiries.
- **User Management**: Verify collectors and manage platform users.

## 🛠️ Tech Stack

**Frontend**
- **React.js**: Core framework
- **Tailwind CSS**: Styling and responsive design
- **Framer Motion**: Smooth UI animations
- **Socket.io Client**: Real-time updates and chat
- **Leaflet / React Map**: Map integration

**Backend**
- **Node.js & Express**: API Server
- **MongoDB**: Database (GeoJSON support for location)
- **Socket.io**: Real-time bidirectional communication
- **JWT**: Robust authentication

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/clean-and-green.git
cd clean-and-green
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory (optional if defaults work):
```env
VITE_API_URL=http://localhost:5000/api
```
Start the client:
```bash
npm run dev
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB Connection String | - |
| `JWT_SECRET` | Secret for signing tokens | - |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 📐 Architecture
The application uses a **Layered Architecture**:
- **Controllers**: Handle request logic.
- **Services**: Encapsulate business logic (e.g., Matching Service).
- **Models**: Mongoose schemas with validation.
- **Routes**: API endpoint definitions.

## 🤝 Contributing
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
