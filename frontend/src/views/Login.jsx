import { useState } from 'react';
import adminServiceInstance from '../Services/Auth';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/goat.png'
import Swal from 'sweetalert2';



export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    api: '' // Added for API errors
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation functions
  const validateForm = (name, value) => {
    let newErrors = { ...errors, api: '' }; // Clear API error on input change

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          newErrors.email = '';
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
        } else {
          newErrors.password = '';
        }
        break;
      default:
        break;
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update state
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }

    // Update touched state
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate input
    const newErrors = validateForm(name, value);
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = validateForm('email', email);
  const passwordErrors = validateForm('password', password);

  setErrors({
    email: newErrors.email,
    password: passwordErrors.password,
    api: ''
  });

  if (!newErrors.email && !passwordErrors.password) {
    setIsLoading(true);
    try {
      await adminServiceInstance.login(email, password);

      // ✅ SweetAlert success notification
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome to the dashboard!',
        timer: 2000,
        showConfirmButton: true
      });

      // Delay navigation slightly to let alert show
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (error) {
      setErrors(prev => ({
        ...prev,
        api: error.message || 'Invalid email or password'
      }));

      // ❌ SweetAlert error notification
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message || 'Invalid email or password'
      });
    } finally {
      setIsLoading(false);
    }
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center p-2">
      <div className="bg-white rounded-2xl shadow-2xl min-h-[30vh] flex justify-center flex-col p-6 w-full max-w-md relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500 to-teal-500 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-300 to-teal-500 rounded-full translate-y-12 -translate-x-12 opacity-10"></div>
        <div className="absolute top-1/2 left-0 w-2 h-16 bg-gradient-to-b from-teal-400 to-teal-600 opacity-20"></div>
        
        {/* Logo and Header */}
        <div className="text-center mb-4 relative z-10">
           
           <img src={Logo} className='w-[15%] rounded-full h-[15%] text-center m-auto' alt="" />
       
          <p className="text-gray-600 mt-4">
            Sign in to access the admin dashboard
          </p>
        </div>
   
        {/* Email/Password Form */}
        <div className="space-y-6 relative z-10">
          {errors.api && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-xl">
              {errors.api}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your admin email"
              className={`w-full px-3 py-2 text-xs  border border-gray-300 rounded-lg  focus:border-none outline-none  focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
          
              disabled={isLoading}
            />
            {touched.email && errors.email && (
              <p className=" text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 -mmt-5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
                 className={`w-full px-3 py-2 text-xs  border border-gray-300 rounded-lg  focus:border-none outline-none  focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 ${
                touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {touched.password && errors.password && (
              <p className=" text-sm text-red-600">{errors.password}</p>
            )}
          </div>
         
          <button
            onClick={handleSubmit}
            disabled={!!errors.email || !!errors.password || isLoading}
            className={` text-sm w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white py-2 px-4 rounded-lg hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-300 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              (errors.email || errors.password || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
          </button>
        </div>
        
        {/* Footer accent */}
        <div className="mt-4 text-center relative z-10">
          <div className="w-16 h-1 bg-gradient-to-r from-teal-400 to-teal-600 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
}