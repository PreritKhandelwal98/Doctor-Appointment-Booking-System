import { useState, useContext } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../utils/config';
import HashLoader from 'react-spinners/HashLoader';
import { toast } from 'react-toastify';
import { authContext } from '../context/authContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loadingState, setLoadingState] = useState(false);

  const { dispatch } = useContext(authContext);
  
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoadingState(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, formData, {
        headers: {
          'Content-type': 'application/json',
        },
      });

      

      const { message, accessToken } = res.data;
      
      const role = res.data.loggedInUser.role
      
      const user = res.data.loggedInUser


      if (res.status >= 200 && res.status < 300) {
        setLoadingState(false);
        toast.success(message);

        // Dispatch login success action
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, role, accessToken } });

        navigate('/home');
      } else {
        throw new Error(message || 'Something went wrong');
      }
    } catch (err) {
      console.error("Error caught in catch block:", err);
      toast.error(err.response?.data?.message || err.message || 'An unknown error occurred');
      setLoadingState(false);
    }
  };

  return (
    <section className="px-5 lg:px-0">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
          Hello! <span className="text-primaryColor">Welcome &nbsp;</span>Back 🎉
        </h3>
        <form className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-5">
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>

          <div className="mb-5">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>

          <div className="mt-7">
            <button
              className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded px-4 py-3"
              type="submit"
              disabled={loadingState}
            >
              {loadingState ? <HashLoader size={24} color="#fff" /> : 'Login'}
            </button>
          </div>

          <p className="mt-5 text-textColor text-center">
            Forgot password? <Link to="/forgot-password" className="text-primaryColor font-medium ml-1">Reset Password</Link>
          </p>
          <p className="mt-5 text-textColor text-center">
            Don&apos;t have an account? <Link to="/register" className="text-primaryColor font-medium ml-1">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;
