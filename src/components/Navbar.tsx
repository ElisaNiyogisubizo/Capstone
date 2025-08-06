import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  MessageCircle,
  PlusCircle,
  Palette,
  Calendar
} from 'lucide-react';
import Avatar from './Avatar';
import { CartIcon } from './CartIcon';

const Navbar: React.FC = () => {
  const { user, logout, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Browse Art', path: '/browse' },
    { name: 'Exhibitions', path: '/exhibitions' },
    { name: 'Virtual Exhibitions', path: '/virtual-exhibitions' },
    { name: 'Artists', path: '/artists' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Show loading state
  if (loading) {
    return (
      <nav className="bg-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Palette className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-xl text-primary">
                The Sundays Art Hub
              </span>
            </Link>
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-xl text-primary">
              The Sundays Art Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-secondary/30'
                    : 'text-gray-700 hover:text-primary hover:bg-secondary/20'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'artist' && (
                  <Link
                    to="/artist/dashboard"
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-primary hover:bg-secondary/20 rounded-md transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create</span>
                  </Link>
                )}
                
                <Link
                  to="/messages"
                  className="p-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* Cart Icon */}
                <CartIcon />

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-secondary/20 transition-colors"
                  >
                    <Avatar src={user.avatar} alt={user.name || 'User'} size="sm" />
                    <span className="text-sm font-medium text-gray-700">{user.name || 'User'}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border animate-fade-in">
                      <Link
                        to="/user/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-secondary/20"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      {user.role === 'artist' && (
                        <>
                          <Link
                            to="/artist/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-secondary/20"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/artist/exhibitions"
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-secondary/20"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Calendar className="w-4 h-4" />
                            <span>My Exhibitions</span>
                          </Link>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-secondary/20"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-secondary/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-secondary/20 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-secondary/30'
                    : 'text-gray-700 hover:text-primary hover:bg-secondary/20'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="border-t pt-4">
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3">
                    <Avatar src={user.avatar} alt={user.name || 'User'} size="md" />
                    <div>
                      <div className="text-base font-medium text-gray-800">{user.name || 'User'}</div>
                      <div className="text-sm text-gray-500 capitalize">{user.role || 'user'}</div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-secondary/20 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user.role === 'artist' && (
                  <Link
                    to="/artist/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-secondary/20 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-secondary/20 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t pt-4 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-secondary/20 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;