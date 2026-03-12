import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import OfferLetterForm from './pages/OfferLetterForm'
import PrivateRoute from './components/PrivateRoute'
import OfferLetterPreviewPage from './pages/OfferLetterPreviewPage';

// In your App.jsx or routing

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/offer-letter/preview" element={<OfferLetterPreviewPage />} />
          <Route
            path="/offer-letter"
            element={
              <PrivateRoute>
                <OfferLetterForm />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-xl shadow-lg"
        />
      </div>
    </Router>
  )
}

export default App
