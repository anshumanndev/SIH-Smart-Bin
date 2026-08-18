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
- FastAPI or Node.js (to be implemented)

### Database
- PostgreSQL

### IoT
- ESP32 microcontroller
- HC-SR04 ultrasonic sensor

---

## 📁 Project Structure

```
smart-bin-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── AlertsPanel.jsx
│   │   ├── AnalyticsView.jsx
│   │   ├── Bin3DVisualizer.jsx
│   │   ├── BinDetailModal.jsx
│   │   ├── BinTable.jsx
│   │   ├── DriverHud.jsx
│   │   ├── Header.jsx
│   │   ├── IoTSimulator.jsx
│   │   ├── KpiCards.jsx
│   │   ├── MapView.jsx
│   │   └── RoutePanel.jsx
│   ├── context/             # React Context
│   │   └── WasteDataContext.jsx
│   ├── data/                # Mock data
│   │   └── mockBins.js
│   ├── utils/               # Utility functions
│   │   ├── audioAlerts.js
│   │   ├── exportUtils.js
│   │   └── routeOptimizer.js
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── index.html               # HTML template
├── PRD.md                   # Product Requirements
├── architecture.md          # System architecture
├── design.md                # Design specifications
├── phases.md                # Project phases
└── README.md                # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart\ Bin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

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

## 📊 Key Features

### 1. **Live Dashboard**
- Real-time bin status visualization
- KPI cards showing waste collection metrics
- Interactive 3D bin visualizer

### 2. **Smart Alerts**
- Audio notifications for critical bin levels
- Alert panel with action tracking
- Historical alert logs

### 3. **Route Optimization**
- Intelligent route calculation
- Driver HUD for navigation
- Multi-stop route planning

### 4. **Analytics & Reporting**
- Comprehensive analytics view
- Data export capabilities
- Historical trends

### 5. **Interactive Map**
- Real-time bin locations
- Route visualization
- Geo-spatial analysis

### 6. **IoT Simulation**
- Mock IoT data generation for testing
- Simulated sensor readings

---

## 📈 Success Metrics

- ✅ Reduce unnecessary collection trips by 30%+
- ✅ Faster waste collection cycles
- ✅ 20%+ reduction in fuel consumption
- ✅ Improved bin maintenance scheduling
- ✅ Enhanced operational efficiency

---

## 👥 User Roles

### Municipal Admin
- System management
- User access control
- Analytics and reporting

### Collection Driver
- View assigned routes
- Mark bins as collected
- Navigation assistance

### City Supervisor
- Monitor collection progress
- Oversee all operations
- Alert management

---

## 🔄 Development Workflow

### Component Development
- Each feature in `src/components/`
- Use React Context for state management
- Follow component naming conventions

### State Management
- Centralized in `WasteDataContext.jsx`
- Mock data in `src/data/mockBins.js`
- Context consumers in components

### Utilities
- Route calculation: `routeOptimizer.js`
- Audio alerts: `audioAlerts.js`
- Data export: `exportUtils.js`

---

## 🧪 Testing

For IoT simulation and testing:
- Use `IoTSimulator.jsx` to generate mock bin data
- Test alert thresholds with various fill levels
- Validate route optimization with multiple scenarios

---

## 📝 Project Documentation

- **[PRD.md](PRD.md)** - Product Requirements Document
- **[architecture.md](architecture.md)** - System Architecture Details
- **[design.md](design.md)** - UI/UX Design Specifications
- **[phases.md](phases.md)** - Project Phases and Timeline

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📋 Roadmap

- [ ] Backend API integration
- [ ] PostgreSQL database setup
- [ ] Real IoT sensor data collection
- [ ] Advanced route optimization algorithms
- [ ] Mobile application
- [ ] Real-time notifications system
- [ ] Machine learning-based predictive analytics
- [ ] Multi-language support

---

## 📞 Support & Contact

For questions or issues, please reach out to the project team or create an issue in the repository.

---

## 📄 License

This project is developed as part of Smart India Hackathon (SIH) PS-14.

---

**Last Updated**: 2026-08-18  
**Version**: 1.0.0
