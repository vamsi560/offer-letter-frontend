# Offer Letter Management Portal - Frontend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

### Modern UI/UX
- **Beautiful Design**: Professional gradient-based design with smooth animations
- **Responsive Layout**: Fully responsive across mobile, tablet, and desktop
- **Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Loading States**: Professional skeleton loaders and loading indicators
- **Data Visualization**: Interactive charts and graphs using Recharts

### Pages
- **Login Page**: Modern centered login with gradient background and animations
- **Dashboard**: 
  - Animated statistics cards
  - Interactive candidate table with avatars
  - Pie chart visualization of offer status
  - Quick actions for each candidate
- **Offer Letter Form**: 
  - Multi-step wizard (4 steps) with progress indicator
  - Real-time salary breakdown calculation
  - Professional form design with icons
  - Currency formatting
  - Step-by-step navigation

### Advanced Features
- **Protected Routes**: Requires authentication to access
- **Toast Notifications**: Enhanced notifications with animations
- **Form Validation**: Real-time validation with visual feedback
- **Auto-calculation**: Automatic salary breakdown from total salary
- **Progress Tracking**: Visual progress indicator for multi-step forms

## Technology Stack

- **React 18**: Latest React features
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Icons**: Icon library
- **Recharts**: Chart library for data visualization
- **React Loading Skeleton**: Professional loading states
- **React Toastify**: Toast notifications
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Test Credentials

- Username: `tag_user1`, Password: `password123`
- Username: `tag_user2`, Password: `password123`
- Username: `tag_user3`, Password: `password123`

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## UI Enhancements

See [UI_ENHANCEMENTS.md](./UI_ENHANCEMENTS.md) for detailed documentation on all UI enhancements and features.
