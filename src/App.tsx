import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistExhibitions from './pages/ArtistExhibitions';
import Exhibitions from './pages/Exhibitions';
import ExhibitionDetails from './pages/ExhibitionDetails';
import VirtualExhibitions from './pages/VirtualExhibitions';
import VirtualExhibitionDetail from './pages/VirtualExhibitionDetail';
import Artists from './pages/Artists';
import ArtistProfile from './pages/ArtistProfile';
import Messages from './pages/Messages';
import Admin from './pages/Admin';
import ArtworkDetail from './pages/ArtworkDetail';
import Checkout from './pages/Checkout';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/artwork/:id" element={<ArtworkDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/user/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/artist/dashboard" element={<ProtectedRoute requiredRole="artist"><ArtistDashboard /></ProtectedRoute>} />
              <Route path="/artist/exhibitions" element={<ProtectedRoute requiredRole="artist"><ArtistExhibitions /></ProtectedRoute>} />
              <Route path="/exhibitions" element={<Exhibitions />} />
              <Route path="/exhibitions/:id" element={<ExhibitionDetails />} />
              <Route path="/virtual-exhibitions" element={<VirtualExhibitions />} />
              <Route path="/virtual-exhibitions/:id" element={<VirtualExhibitionDetail />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:id" element={<ArtistProfile />} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#16425b',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#d9dcd6',
                    secondary: '#16425b',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;