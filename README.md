# Smart Waste Bin with Route Optimization 🗑️

A comprehensive IoT-enabled waste management system designed to monitor bin fill levels in real-time and generate optimized collection routes for municipal waste collection services.

**Project**: SIH PS-14 | **Status**: Active Development

---

## 🎯 Problem Statement

Waste management in urban areas faces several challenges:
- Overflowing trash bins causing unsanitary conditions
- Fixed collection routes leading to unnecessary trips
- High fuel consumption and operational costs
- Lack of real-time bin monitoring capabilities
- No data-driven insights for route optimization

## ✨ Solution

Our Smart Bin system provides:
- **Real-time Monitoring**: IoT sensors track bin fill levels continuously
- **Intelligent Alerts**: Notifications when bins reach critical levels (70%+)
- **Route Optimization**: AI-driven algorithms generate efficient collection routes
- **Analytics Dashboard**: Comprehensive insights into waste collection metrics
- **Multi-user Support**: Admin, drivers, and supervisors with role-specific views

---

## 🏗️ System Architecture

```
Smart Bin (Ultrasonic + ESP32)
        ↓ Wi-Fi/API
   Backend Server
        ↓
   PostgreSQL DB
        ↓
Route Optimization Engine
        ↓
React Dashboard
        ↓
Driver / Municipal Team
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.3 - UI framework
- **Tailwind CSS** 3.4 - Styling
- **Leaflet** 1.9 - Interactive maps
- **Vite** 6.0 - Build tool
- **Lucide React** - Icon library

### Backend
- FastAPI or Node.js

### Database
- PostgreSQL

### IoT
- ESP32 microcontroller
- HC-SR04 ultrasonic sensor

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anshumanndev/SIH-Smart-Bin.git
   cd SIH-Smart-Bin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## ☁️ Deploy on Vercel

1. Push your latest code to GitHub repository `anshumanndev/SIH-Smart-Bin`.
2. Open [Vercel Dashboard](https://vercel.com/new).
3. Click **Add New...** -> **Project** and import `anshumanndev/SIH-Smart-Bin`.
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**.

---

## 📄 License

This project is developed as part of Smart India Hackathon (SIH) PS-14.
