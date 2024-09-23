/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AiOutlineDelete } from "react-icons/ai";
import uploadToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL, token } from "../../utils/config";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: '',
    phone: "",
    photo: null
  });


  const [selectedFile, setSelectedFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();

  
  useEffect(() => {
    if (doctorData && doctorData.data) {
      const formatDate = (date) => date.split('T')[0];
      const formatTime = (time) => {
        const [hour, minute] = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', { hour12: false }).split(':');
        return `${hour}:${minute}`;
      };
      setFormData({
        name: doctorData.data.doctor.name || "",
        email: doctorData.data.doctor.email || "",
        phone: doctorData.data.doctor.phone || "",
        about: doctorData.data.doctor.about || "",
        bio: doctorData.data.doctor.bio || "",
        gender: doctorData.data.doctor.gender || "",
        specialization: doctorData.data.doctor.specialization || "",
        ticketPrice: doctorData.data.doctor.ticketPrice || 0,
        qualification: doctorData.data.doctor.qualifications.map(q => ({
          ...q,
          startingDate: formatDate(q.startingDate),
          endingDate: formatDate(q.endingDate),
        })) || [{ startingDate: "", endingDate: "", degree: "", university: "" }],
        experience: doctorData.data.doctor.experiences.map(e => ({
          ...e,
          startingDate: formatDate(e.startingDate),
          endingDate: formatDate(e.endingDate),
        })) || [{ startingDate: "", endingDate: "", position: "", hospital: "" }],
        timeSlots: doctorData.data.doctor.timeSlots.map(slot => ({
          ...slot,
          startingTime: formatTime(slot.startingTime),
          endingTime: formatTime(slot.endingTime),
        })) || [{ day: "", startingTime: "", endingTime: "" }],
        photo: doctorData.data.doctor.photo || null
      });
    }
  }, [doctorData]);

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadToCloudinary(file);

    setPreviewUrl(data.url)
    setSelectedFile(data.url)
    setFormData({ ...formData, photo: data.url })
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const navigate = useNavigate();

  const updateProfileHandle = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(`${BASE_URL}/doctors/profile/me/${doctorData.data.doctor._id}`, formData, {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { message } = res.data;

      if (res.status >= 200 && res.status < 300) {
        toast.success(message);
        navigate('/doctors/profile/me');
      }

    } catch (err) {
      toast.error(err.message);
    }
  }

  

 

 


  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">Profile Info</h2>
      <form onSubmit={updateProfileHandle}>
        <div className="mb-5">
          <p className="form__label">Name</p>
          <input
            className="form__input"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Email</p>
          <input
            className="form__input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Mobile Number</p>
          <input
            className="form__input"
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Mobile Number"
          />
        </div>
        <div className="mb-5">
          <p className="form__label">Bio</p>
          <input
            className="form__input"
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Bio"
            maxLength={100}
          />
        </div>
        <div className="mb-5">
          <p className="form__label">About</p>
          <input
            className="form__input"
            type="text"
            name="bio"
            value={formData.about}
            onChange={handleInputChange}
            placeholder="About"
            maxLength={100}
          />
        </div>
        <div className="mb-5">
          <div className="grid grid-cols-3 gap-5 mb-[30px]">
            <div>
              <p className="form__label">Gender</p>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <p className="form__label">Specialization</p>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                className="form__input py-3.5"
              >
                <option value="">Select</option>
                <option value="surgeon">Surgeon</option>
                <option value="neurologist">Neurologist</option>
                <option value="dermatologist">Dermatologist</option>
              </select>
            </div>
            <div>
              <p className="form__label">Ticket Price</p>
              <input
                type="text"
                className="form__input"
                placeholder="100"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="mb-5">
          <p className="form__label">Upload Photo</p>
          <input
            className="form__input"
            type="file"
            onChange={handleFileInputChange}
          />
          {previewUrl && <img src={previewUrl} alt="Preview" />}
        </div>
        <button className="bg-primaryColor text-white py-3 px-6 rounded-lg w-full mt-5">Update Profile</button>
      </form>
    </div>
  )
};

export default Profile;
