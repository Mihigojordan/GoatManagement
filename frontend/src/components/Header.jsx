import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import adminServiceInstance from '../Services/Auth';

const Header = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // user dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile nav menu
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await adminServiceInstance.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUsername = (name) => {
    return adminServiceInstance.getInitials(name);
  };

  const handleLogout = async () => {
    try {
      await adminServiceInstance.logout();
      navigate('/', { replace: true });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm p-2">
      <div className="max-w-8xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo (left) */}
          <div className="flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-teal-600 flex items-center">
              <span className="text-2xl sm:text-2xl mr-2">🐐</span>
              <span className="hidden xs:inline">GoatSys</span>
              <span className="xs:hidden">Goat Management System</span>
            </div>
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  isActive
                    ? 'text-teal-600 border-teal-500'
                    : 'text-gray-600 border-transparent hover:text-teal-500 hover:border-teal-300'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/manage-goat"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  isActive
                    ? 'text-teal-600 border-teal-500'
                    : 'text-gray-600 border-transparent hover:text-teal-500 hover:border-teal-300'
                }`
              }
            >
              Manage Goat
            </NavLink>
            <NavLink
              to="/dashboard/check_in-check_out"
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
                  isActive
                    ? 'text-teal-600 border-teal-500'
                    : 'text-gray-600 border-transparent hover:text-teal-500 hover:border-teal-300'
                }`
              }
            >
              Checkin & Checkout
            </NavLink>
          </nav>

          {/* Right side - User info and mobile menu button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User greeting - hidden on small screens */}
            <span className="text-gray-700 text-sm hidden lg:block">
              Hello, {user?.names || 'User'}
            </span>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-500 cursor-pointer rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base hover:bg-teal-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="User menu"
              >
                {handleUsername(user?.names) || 'U'}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100 lg:hidden">
                    Hello, {user?.names || 'User'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-teal-600 hover:bg-teal-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <nav className="px-2 pt-2 pb-4 space-y-1 bg-gray-50 rounded-lg mt-2 mb-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'text-teal-600 font-semibold'
                    : 'text-gray-600 hover:text-teal-500'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/manage-goat"
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'text-teal-600 font-semibold'
                    : 'text-gray-600 hover:text-teal-500'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Manage Goat
            </NavLink>
            <NavLink
              to="/dashboard/check_in-check_out"
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'text-teal-600 font-semibold'
                    : 'text-gray-600 hover:text-teal-500'
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Checkin & Checkout
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;