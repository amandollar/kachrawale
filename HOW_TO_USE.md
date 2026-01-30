# 🧪 HOW TO USE: Clean & Green (Full Walkthrough)

Welcome! This guide will help you test every feature of the **Clean & Green** app like a pro. We will simulate the real world by acting as three different people: the **Boss (Admin)**, the **Worker (Collector)**, and the **User (Citizen)**.

## 🏁 Prerequisites
1.  Make sure the **Backend** is running (`npm run start` or `npm run dev` in backend folder).
2.  Make sure the **Frontend** is running (`npm run dev` in frontend folder).
3.  **Pro Tip**: Use **3 Different Browsers** (e.g., Chrome, Firefox, Edge) OR **Incognito/Private Windows** to log in as 3 different people at the same time without logging out.

---

## 🎭 Step 1: Become the "God Mode" Admin
*By default, everyone joins as a normal user. You must manually promote yourself to Admin.*

1.  **Open Browser 1 (e.g., Chrome)**: Go to the app (normally `http://localhost:5173`).
2.  **Register**: Sign up a new user (Name: `Super Admin`, Email: `admin@clean.com`, Password: `123`).
3.  **The "Database Hack"**:
    *   Open your MongoDB tool (MongoDB Compass or Shell).
    *   Go to your database (likely `clean-green-db` or `kachrawala`).
    *   Open the `users` collection.
    *   Find the entry for `admin@clean.com`.
    *   Edit the field `"role": "citizen"` ➔ Change it to **`"role": "admin"`**.
    *   Click **Update/Save**.
4.  **Back to Browser 1**: Refresh the page.
    *   🎉 **Success!** You will now see the specialized **Admin Dashboard**.
5.  **Vital Action**: Go to **"Manage Rates"** tab and set prices (e.g., Plastic = ₹15, Metal = ₹40). The app needs these to calculate payouts!

---

## 🚛 Step 2: Hire the Workforce (Collector)
*Collectors are special employees who need verification.*

1.  **Open Browser 2 (e.g., Firefox)**.
2.  **Register**:
    *   Select Role: **"Waste Collector"**.
    *   Enter Details: Name (`Driver Dan`), Email (`driver@clean.com`), Vehicle Info.
3.  **The Block**: You will see a **"Verification Pending"** screen. You cannot access the dashboard yet. This is security!
4.  **Switch to Browser 1 (Admin)**:
    *   Go to your Admin Dashboard.
    *   Look for the **"Approvals"** or **"Collectors"** tab.
    *   You will see `Driver Dan` waiting.
    *   Click **✅ Approve**.
5.  **Switch back to Browser 2 (Collector)**:
    *   Refresh the page.
    *   🚀 **Boom!** You are now in the **Collector Dashboard** with a map and job list.

---

## 🏡 Step 3: The Citizen (User)
*The normal user who wants to clean their home and earn money.*

1.  **Open Browser 3 (e.g., Edge)**.
2.  **Register**: Sign up as **Citizen** (Name: `Citizen Joe`, Email: `user@clean.com`).
    *   **New Feature**: Enter your **UPI ID** / Google Pay number in the registration form so you can get paid!
3.  **Schedule Pickup**:
    *   Click **"New Pickup"**.
    *   Select Waste Type (e.g., **"Plastic"**).
    *   **Upload Photo**: Click to upload an image of your waste (we accept all formats now!).
    *   **Location**: The app auto-detects your location.
    *   Click **Request Pickup**.

---

## 🔄 Step 4: The Clean & Green Cycle (Magic Time)
*Now watch how all three connect in real-time!*

1.  **Browser 2 (Collector)**:
    *   You will receive a **Notification** or see a "New Pickup" alert.
    *   Check the **"Available Pickups"** list.
    *   Click **"Accept Job"**.
    *   Your status updates to **"On The Way"**.

2.  **Browser 3 (Citizen)**:
    *   Look at your dashboard.
    *   **Live Tracking**: A map will appear showing the Collector coming to your location!
    *   You'll see the collector's photo and vehicle details.

3.  **Browser 2 (Collector - Arrival)**:
    *   When you reach the house, click **"Verify / Weigh Waste"**.
    *   Enter the actual weight (e.g., `10 kg`).
    *   The app calculates the Total (10 kg × ₹15 Rate = **₹150**).
    *   Click **"Complete Pickup"**.

4.  **Browser 3 (Citizen - Paid)**:
    *   Refresh/Check Dashboard.
    *   The job is **Completed**.
    *   Go to **Profile** ➔ You will see **₹150** added to your "Total Earnings".
    *   You saved the planet! 🌍

---

### 🕵️ Extras to Check
*   **Profile**: Check if your UPI ID is visible.
*   **Admin Stats**: The Admin dashboard will update to show "Total Waste Collected" and "Payouts Pending".

---

## 💬 Step 5: Real-Time Communication
*How the Customer and Collector talk during a delivery.*

1.  **Start a Chat**:
    *   **As Citizen**: On your Dashboard, find your Active Pickup. Click the **"Message Center"** button (or go to the **Messages** tab).
    *   **As Collector**: In your "My Tasks" list, click **"Message Center"** on the specific job.
2.  **Live Chat**:
    *   Type a message (e.g., "I am at the gate").
    *   Check the other browser. The message appears **instantly**! ⚡
    *   This keeps privacy safe (no need to share phone numbers).

## 🆘 Step 6: Customer Support
*How issues are resolved.*

1.  **Raising a Query**:
    *   Go to **"Messages"** tab on the Dashboard.
    *   If you have an issue with a specific pickup, you can chat directly with the assigned Collector to resolve delays or location issues.
    *   For general help, the **"Support"** channel (if enabled by Admin) appears here.
2.  **Resolution**:
    *   Collectors can also report issues (like "Waste not found") which creates a log for the Admin to review.
