import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import forgotImg from './../assets/images/forgot.png';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/config';
import HashLoader from 'react-spinners/HashLoader';
import axios from 'axios';

function ForgotPassword() {
  const [loadingState, setLoadingState] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false); // To check if the form is fully filled
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    validateForm(); // Validate form on every change
  }, [formData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    // Required fields validation
    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
      valid = false;
    }
    
    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);
    setIsFormValid(valid); // Enable form only if valid
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoadingState(true);

    if (!isFormValid) {
      toast.error('Please fill all fields correctly');
      setLoadingState(false);
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password`, formData, {
        headers: {
          'Content-type': 'application/json',
        },
      });

      const { message } = res.data;

      if (res.status >= 200 && res.status < 300) {
        setLoadingState(false);
        toast.success(message);
        navigate('/login'); // Redirect to login after successful password reset request
      } else {
        throw new Error(message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error caught in catch block:', err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred'
      );
      setLoadingState(false);
    }
  };

  return (
    <section className="px-5 xl:px-0 py-[75px]">
      <div className="max-w-[1170px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image box */}
          <div className="hidden lg:block bg-primaryColor rounded-l-lg">
            <figure className="rounded-l-lg">
              <img src={forgotImg} alt="" className="w-full rounded-l-lg" />
            </figure>
          </div>

          {/* Forgot Password form */}
          <div className="rounded-lg lg:pl-16 py-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold">
              Recover <span className="text-primaryColor">Password</span>
            </h3>

            <form className="py-4 md:py-0" onSubmit={submitHandler}>
              <div className="mb-5">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form__input"
                  required
                />
                {errors.email && (
                  <p className="text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="mt-7">
                <button
                  disabled={!isFormValid || loadingState} // Disable button if form is invalid or loading
                  className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded px-4 py-3"
                  type="submit"
                >
                  {loadingState ? (
                    <HashLoader size={35} color="#ffffff" />
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
