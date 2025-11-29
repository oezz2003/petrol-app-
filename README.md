# Petrol App Project

This monorepo contains the source code for the Petrol App platform, designed with a clear separation of concerns: a mobile application for end-users and a web-based admin dashboard for management, both powered by a unified Supabase backend.

## 📂 Project Structure

| Directory | Application | Target Audience | Tech Stack |
|-----------|-------------|-----------------|------------|
| **`mobileapp/`** | **Mobile App** | End Users | Expo (React Native) |
| **`my-app/`** | **Admin Dashboard** | Admins & Managers | Next.js (React) |

---

## 🚀 Architecture Overview

### 1. Mobile App (User Facing)
The mobile application is the primary interface for general users.
- **Purpose**: To allow users to interact with the service (e.g., browsing, ordering, tracking).
- **Key Tech**:
  - **Framework**: Expo (React Native)
  - **Routing**: Expo Router
  - **Backend Integration**: Supabase Client (Mobile)

### 2. Web Dashboard (Admin & Data Management)
The web application serves as the control center for the platform.
- **Purpose**: For administrators to manage users, view data, and control application content.
- **Key Tech**:
  - **Framework**: Next.js (App Router)
  - **Styling**: Tailwind CSS
  - **Backend Integration**: Supabase Client (Web)

### 3. Backend Infrastructure (Supabase)
Both applications share a single Supabase project to ensure data consistency.
- **Database**: PostgreSQL
- **Authentication**: Shared User Management (Supabase Auth)
- **Real-time**: Real-time updates for critical data
- **Storage**: Media and asset hosting

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (LTS version)
- npm or yarn
- Expo Go app (for testing mobile on device)

### 1. Setup Mobile App
```bash
cd mobileapp
npm install
npx expo start
```
*Scan the QR code with Expo Go to run.*

### 2. Setup Web Admin Dashboard
```bash
cd my-app
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) to view.*

---

## 🔐 Configuration (Supabase)

To connect the apps to your backend, you will need to configure environment variables in both directories.

**1. Create `.env` files:**
- `mobileapp/.env`
- `my-app/.env.local`

**2. Add Keys:**
```env
# For Mobile (Expo)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For Web (Next.js)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
