import uploadToCloudinary from '../../utils/uploadCloudinary';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, token } from '../../utils/config';
import axios from 'axios';
import { toast } from 'react-toastify';
import HashLoader from 'react-spinners/HashLoader';

const Profile = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingState, setLoadingState] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bloodType: '',
    photo: '',
    gender: 'male',
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.data.name || '',
        email: user.data.email || '',
        photo: user.data.photo || '',
        bloodType: user.data.bloodType || '',
        gender: user.data.gender || 'male',
      });
      setSelectedFile(user.data.photo || null);

    }
  }, [user]);

  

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadToCloudinary(file);

    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });

  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoadingState(true);

    try {
      const res = await axios.put(`${BASE_URL}/user/${user.data._id}`, formData, {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { message } = res.data;

      if (res.status >= 200 && res.status < 300) {
        toast.success(message);
        navigate('/users/profile/me');
      } else {
        throw new Error(message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error caught in catch block:', err);
      toast.error(err.response?.data?.message || err.message || 'An unknown error occurred');
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="mt-10">
      <form className="py-4 md:py-0" onSubmit={submitHandler}>
        <div className="mb-5">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="form__input"
            required
          />
        </div>
        <div className="mb-5">
          <input
            type="email"
            placeholder="Enter your Email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="form__input"
            required
          />
        </div>
        <div className="mb-5">
          <input
            type="password"
            placeholder="Password"
            value={formData.password || ''}
            onChange={handleInputChange}
            name="password"
            className="form__input"
          />
        </div>
        <div className="mb-5">
          <input
            type="text"
            placeholder="Blood Type"
            value={formData.bloodType || ''}
            onChange={handleInputChange}
            name="bloodType"
            className="form__input"
            required
          />
        </div>
        <div className="mb-5 flex items-center justify-between">
          <label className="text-headingColor font-bold text-[16px] leading-7">
            Gender:
            <select
              value={formData.gender || ''}
              onChange={handleInputChange}
              name="gender"
              className="text-textColor font-semibold text-[16px] leading-7 px-4 py-3 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img src={formData.photo} alt="Profile" className="w-full rounded-full" />
            </figure>
          )}
          <div className="relative w-[160px] h-[50px]">
            <input
              type="file"
              onChange={handleFileInputChange}
              name="photo"
              id="customFile"
              accept=".jpg,.png"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            />
            <label
              htmlFor="customFile"
              className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-8 overflow-hidden bg-[#0066ff46] text-headingColor font-semibold rounded-lg truncate cursor-pointer"
            >
              {selectedFile ? selectedFile.split('/').pop() : 'Upload Photo'}
            </label>
          </div>
        </div>
        <div className="mt-7">
          <button
            disabled={loadingState}
            className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded px-4 py-3"
            type="submit"
          >
            {loadingState ? <HashLoader size={25} color="#ffffff" /> : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
