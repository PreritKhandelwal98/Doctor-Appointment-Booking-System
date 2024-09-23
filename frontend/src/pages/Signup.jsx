import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import signupImg from './../assets/images/signup.gif';
import uploadToCloudinary from '../utils/uploadCloudinary';
import { toast } from 'react-toastify';
import { BASE_URL } from '../utils/config';
import HashLoader from 'react-spinners/HashLoader';
import axios from 'axios';

function Signup() {
  const [selectedFile, setSelectedFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [loadingState, setLoadingState] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); // State to track photo upload
  const [isFormValid, setIsFormValid] = useState(false); // To check if the form is fully filled
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    photo: null,
    gender: 'male',
    role: 'patient',
  });
  const navigate = useNavigate();

  useEffect(() => {
    validateForm(); // Validate form on every change
  }, [formData, uploadingPhoto]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadingPhoto(true); // Set uploading state to true
      try {
        const data = await uploadToCloudinary(file);
        setPreviewUrl(data.url);
        setSelectedFile(data.url);
        setFormData({ ...formData, photo: data.url });
      } catch (err) {
        toast.error('Photo upload failed',err);
      } finally {
        setUploadingPhoto(false); // Set uploading state to false after upload is done
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let valid = true;

    // Required fields validation
    if (!formData.name) {
      newErrors.name = 'Full Name is required';
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
      valid = false;
    }
    if (!formData.photo) {
      newErrors.photo = 'Profile picture is required';
      valid = false;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);

    // Enable the form only if all validations pass and photo is not uploading
    setIsFormValid(valid && !uploadingPhoto);
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
      const res = await axios.post(`${BASE_URL}/auth/register`, formData, {
        headers: {
          'Content-type': 'application/json',
        },
      });

      const { message } = res.data;

      if (res.status >= 200 && res.status < 300) {
        setLoadingState(false);
        toast.success(message);
        navigate('/login');
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
              <img src={signupImg} alt="" className="w-full rounded-l-lg" />
            </figure>
          </div>

          {/* Signup form */}
          <div className="rounded-lg lg:pl-16 py-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold">
              Create an <span className="text-primaryColor">account</span>
            </h3>

            <form className="py-4 md:py-0" onSubmit={submitHandler}>
              <div className="mb-5">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form__input"
                  required
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>
              <div className="mb-5">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form__input"
                  required
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}
              </div>
              <div className="mb-5">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  name="password"
                  className="form__input"
                  required
                />
                {errors.password && <p className="text-red-500">{errors.password}</p>}
              </div>
              <div className="mb-5">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  name="confirmPassword"
                  className="form__input"
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="mb-5 flex items-center justify-between">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Are you a: <span className="text-red-500">*</span>
                  <select
                    name="role"
                    className="text-textColor font-semibold text-[16px] leading-7 px-4 py-3 focus:outline-none"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </label>

                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Gender <span className="text-red-500">*</span>
                  <select
                    value={formData.gender}
                    onChange={handleInputChange}
                    name="gender"
                    className="text-textColor font-semibold text-[16px] leading-7 px-4 py-3 focus:outline-none"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>

              <div className="mb-5 flex items-center gap-3">
                {uploadingPhoto ? (
                  <div><HashLoader size={20} color="#000000" /></div> // Show this while photo is uploading
                ) : (
                  selectedFile && (
                    <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Uploaded"
                        className="w-full rounded-full"
                      />
                    </figure>
                  )
                )}

                <div className="relative w-[160px] h-[50px]">
                  <input
                    type="file"
                    onChange={handleFileInputChange}
                    name="photo"
                    id="customFile"
                    accept=".jpg,.png"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-8 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
                  >
                    Upload Photo
                  </label>
                </div>
                {errors.photo && <p className="text-red-500">{errors.photo}</p>}
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
                    'Sign Up'
                  )}
                </button>
              </div>
              <p className="mt-5 text-textColor text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primaryColor font-medium ml-1">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Signup;
