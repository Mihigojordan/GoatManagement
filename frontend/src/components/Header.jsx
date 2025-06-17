import { Search, Bell, User, LogOut, Lock } from 'lucide-react';

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import adminServiceInstance from '../Services/Auth';

const Header = () => {
    const [user, setUser] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    function handleUsername(name) {
        return adminServiceInstance.getInitials(name);
    }

    const handleLogout = async () => {
        try {
            await adminServiceInstance.logout();
            navigate('/dispatch',{ replace: true }); // Redirect to login page after logout
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleLock = async () => {
        try {
            await adminServiceInstance.lock(); // Call the lock method
            navigate('/dispatch/lock',{ replace: true }); // Navigate to the lock screen
            setIsDropdownOpen(false);
        } catch (error) {
            console.error('Lock failed:', error);
            navigate('/dispatch/lock',{ replace:true}); // Navigate even if the lock fails, as a fallback
        }
    };

    return ( 
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 sticky top-0 z-50 ">
            <div className="text-xl font-semibold text-gray-800">
                Good Morning, {user?.names || 'User'}
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="relative">
                    <Bell className="text-gray-600" />
                    <span className="absolute -top-1 -right-1 text-sm bg-red-500 text-white  rounded-full h-4 w-4 flex items-center justify-center">
                        2
                    </span>
                </div>
                <div className="relative" ref={dropdownRef}>
                    <div
                        className="w-10 h-10 bg-blue-500 cursor-pointer rounded-full flex items-center justify-center text-white font-semibold"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {handleUsername(user?.names) || 'U'}
                    </div>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLock}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Lock
                                </button>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-teal-50"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;