# Kachrawale Backend Documentation 🗑️♻️

> **"Zomato for Waste Management"** - A platform connecting Citizens, Collectors, and Recyclers to optimize urban waste collection.

## 🏗️ Architecture Overview

The backend is built as a RESTful API using **Node.js** and **Express**, backed by **MongoDB**. It employs a layered architecture:
-   **Controllers**: Handle HTTP requests and responses (Standardized `ApiResponse`).
-   **Services**: Business logic (e.g., `matchingService`, `emailService`).
-   **Models**: Mongoose schemas with validation.
-   **Middleware**: Auth (JWT), Validation (Zod), Error Handling (`ApiError`).

## 🛠️ Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose) + GeoJSON for location.
-   **Authentication**: JWT (Cookies), bcryptjs.
-   **Validation**: Zod.
-   **Real-time**: Socket.io (for Notifications/Matching).
-   **Email**: Nodemailer.
-   **Security**: Helmet, CORS.

---

## 🚀 Setup & Installation

1.  **Environment Variables** (`.env`):
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/kachrawale
    JWT_SECRET=your_secret_key
    CLIENT_URL=http://localhost:5173
    SMTP_HOST=smtp.gmail.com
    SMTP_EMAIL=your@gmail.com
    SMTP_PASSWORD=your_app_password
    ```

2.  **Run Locally**:
    ```bash
    npm install
    npm run dev
    ```

---

## 📚 API Reference

### 🔐 Auth (`/api/auth`)
| Method | Endpoint    | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register Citizen (Verified) or Collector/Recycler (Unverified). Sends Welcome Email. |
| `POST` | `/login`    | Public | Login and receive JWT cookie. |
| `GET`  | `/me`       | Private| Get current user details. |
| `GET`  | `/logout`   | Private| Clear auth cookie. |

### 🚛 Pickups (`/api/pickups`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Citizen | Create a pickup request (Waste Type, Weight, Location, Img/Vid). Triggers matching algorithm to find Collectors. |
| `GET` | `/` | All | Get pickups. Citizens see theirs. Collectors see available/assigned. Admins see all. |
| `PUT` | `/:id/status` | Col/Adm | Update status (ACCEPTED -> ON_THE_WAY -> COMPLETED). Collectors verify weight here. |
| `GET` | `/:id` | Private | Get single pickup details. |

### ♻️ Marketplace (`/api/marketplace`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Recycler | View available verified waste (Status: `COMPLETED`). |
| `POST` | `/:id/buy` | Recycler | Purchase a waste lot. Creates a `Transaction` and marks Pickup as `SETTLED`. |

### 👮‍♂️ Admin (`/api/admin`)
| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin | Dashboard KPIs (Total Waste, Users, etc.). |
| `GET` | `/heatmap` | Admin | GeoJSON points of all waste pickups for visualization. |
| `GET` | `/verifications`| Admin | List pending KYC users (Collectors/Recyclers). |
| `PUT` | `/verify/:id` | Admin | Approve a user (`isVerified: true`). |

---

## 💾 Data Models

### 👤 User
-   **Roles**: `citizen`, `collector`, `recycler`, `admin`.
-   **Data**: Name, Email, Phone, Address (GeoJSON).
-   **Status**: `isVerified` (Boolean).

### 📦 Pickup
-   **Fields**: `wasteType` (plastic, metal, organic, e-waste), `weight`, `images`, `video` (mandatory for non-organic).
-   **Status**: `CREATED` -> `ASSIGNED` -> `ACCEPTED` -> `COMPLETED` -> `SETTLED`.
-   **Relations**: `citizen` (Ref), `collector` (Ref).

### 💳 Transaction
-   **Type**: `PAYOUT` (Collector pays Citizen) or `PURCHASE` (Recycler buys from Platform).
-   **Status**: `PENDING`, `SUCCESS`.
-   **Amount**: Calculated based on waste weight * market rate.

---

## 🌟 Key Features

1.  **Algorithmic Matching**: Automatically matches new pickups with nearby Collectors based on location (GeoJSON).
2.  **Robust Validation**: Zod schemas ensure data integrity (e.g., Video required for plastic).
3.  **Role-Based Access Control (RBAC)**: Strict middleware enforces endpoint security.
4.  **KYC Workflow**: Admins must approve service providers before they enter the ecosystem.
5.  **Marketplace**: Closed-loop economy where Recyclers buy verified stock.
6.  **Standardized API**: All responses follow `{ statusCode, success, data, message }` format.
