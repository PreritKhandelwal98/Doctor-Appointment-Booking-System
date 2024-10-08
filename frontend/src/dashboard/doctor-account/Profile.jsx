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
    bio: "",
    about:"",
    gender: "",
    specialization: "",
    ticketPrice: 0,
    qualifications: [{ startingDate: "", endingDate: "", degree: "", university: "" }],
    experiences: [{ startingDate: "", endingDate: "", position: "", hospital: "" }],
    timeSlots: [{ day: "", startingTime: "", endingTime: "" }],
    photo: null,
    signaature:null
  });


  const [previewPhotoUrl, setPreviewPhotoUrl] = useState();
  const [previewSignatureUrl, setPreviewSignatureUrl] = useState(); // Separate preview URL for signature

  
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
        qualifications: doctorData.data.doctor.qualifications.map(q => ({
          ...q,
          startingDate: formatDate(q.startingDate),
          endingDate: formatDate(q.endingDate),
        })) || [{ startingDate: "", endingDate: "", degree: "", university: "" }],
        experiences: doctorData.data.doctor.experiences.map(e => ({
          ...e,
          startingDate: formatDate(e.startingDate),
          endingDate: formatDate(e.endingDate),
        })) || [{ startingDate: "", endingDate: "", position: "", hospital: "" }],
        timeSlots: doctorData.data.doctor.timeSlots.map(slot => ({
          ...slot,
          startingTime: formatTime(slot.startingTime),
          endingTime: formatTime(slot.endingTime),
        })) || [{ day: "", startingTime: "", endingTime: "" }],
        photo: doctorData.data.doctor.photo || null,
        signature: doctorData.data.doctor.signature || null // Initialize signature
      });
    }
  }, [doctorData]);

  const handlePhotoInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadToCloudinary(file);
    
    setPreviewPhotoUrl(data.url);
    setFormData((prev) => ({ ...prev, photo: data.url }));
  };

  const handleSignatureInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadToCloudinary(file);

    setPreviewSignatureUrl(data.url);
    setFormData((prev) => ({ ...prev, signature: data.url })); // Save to signature
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

  const handleQualificationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index][name] = value;
    setFormData((prevState) => ({ ...prevState, qualifications: updatedQualifications }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...formData.experiences];
    updatedExperience[index][name] = value;
    setFormData((prevState) => ({ ...prevState, experiences: updatedExperience }));
  };

  const handleTimeSlotChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[index][name] = value;
    setFormData((prevState) => ({ ...prevState, timeSlots: updatedTimeSlots }));
  };

  const addQualification = () => {
    setFormData((prevState) => ({
      ...prevState,
      qualifications: [...prevState.qualifications, { startingDate: "", endingDate: "", degree: "", university: "" }],
    }));
  };

  const deleteQualification = (index) => {
    const updatedQualifications = formData.qualifications.filter((_, i) => i !== index);
    setFormData((prevState) => ({ ...prevState, qualifications: updatedQualifications }));
  };

  const addExperience = () => {
    setFormData((prevState) => ({
      ...prevState,
      experiences: [...prevState.experiences, { startingDate: "", endingDate: "", position: "", hospital: "" }],
    }));
  };

  const deleteExperience = (index) => {
    const updatedExperience = formData.experiences.filter((_, i) => i !== index);
    setFormData((prevState) => ({ ...prevState, experiences: updatedExperience }));
  };

  const addTimeSlot = () => {
    setFormData((prevState) => ({
      ...prevState,
      timeSlots: [...prevState.timeSlots, { day: "", startingTime: "", endingTime: "" }],
    }));
  };

  const deleteTimeSlot = (index) => {
    const updatedTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData((prevState) => ({ ...prevState, timeSlots: updatedTimeSlots }));
  };

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
            maxLength={500}
          />
        </div>
        <div className="mb-5">
          <p className="form__label">About</p>
          <input
            className="form__input"
            type="text"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
            placeholder="About"
            
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
                <option value="cardiologist ">Cardiologist </option>
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
          <p className="form__label">Qualification</p>
          {formData.qualifications?.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="form__label">Starting Date</p>
                  <input
                    className="form__input"
                    type="date"
                    name="startingDate"
                    value={item.startingDate}
                    onChange={(e) => handleQualificationChange(index, e)}
                  />
                </div>
                <div>
                  <p className="form__label">Ending Date</p>
                  <input
                    className="form__input"
                    type="date"
                    name="endingDate"
                    value={item.endingDate}
                    onChange={(e) => handleQualificationChange(index, e)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <div>
                  <p className="form__label">Degree</p>
                  <input
                    className="form__input"
                    type="text"
                    name="degree"
                    value={item.degree}
                    onChange={(e) => handleQualificationChange(index, e)}
                    placeholder="Degree"
                  />
                </div>
                <div>
                  <p className="form__label">University</p>
                  <input
                    className="form__input"
                    type="text"
                    name="university"
                    value={item.university}
                    onChange={(e) => handleQualificationChange(index, e)}
                    placeholder="University"
                  />
                </div>
              </div>
              <button
                className="bg-red-500 text-white p-2 rounded mt-3"
                type="button"
                onClick={() => deleteQualification(index)}
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
          <button
            className="bg-blue-500 text-white p-2 rounded mt-3"
            type="button"
            onClick={addQualification}
          >
            Add Qualification
          </button>
        </div>
        <div className="mb-5">
          <p className="form__label">Experience</p>
          {formData.experiences?.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="form__label">Starting Date</p>
                  <input
                    className="form__input"
                    type="date"
                    name="startingDate"
                    value={item.startingDate}
                    onChange={(e) => handleExperienceChange(index, e)}
                  />
                </div>
                <div>
                  <p className="form__label">Ending Date</p>
                  <input
                    className="form__input"
                    type="date"
                    name="endingDate"
                    value={item.endingDate}
                    onChange={(e) => handleExperienceChange(index, e)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 mt-3">
                <div>
                  <p className="form__label">Position</p>
                  <input
                    className="form__input"
                    type="text"
                    name="position"
                    value={item.position}
                    onChange={(e) => handleExperienceChange(index, e)}
                    placeholder="Position"
                  />
                </div>
                <div>
                  <p className="form__label">Hospital</p>
                  <input
                    className="form__input"
                    type="text"
                    name="hospital"
                    value={item.hospital}
                    onChange={(e) => handleExperienceChange(index, e)}
                    placeholder="Hospital"
                  />
                </div>
              </div>
              <button
                className="bg-red-500 text-white p-2 rounded mt-3"
                type="button"
                onClick={() => deleteExperience(index)}
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
          <button
            className="bg-blue-500 text-white p-2 rounded mt-3"
            type="button"
            onClick={addExperience}
          >
            Add Experience
          </button>
        </div>
        <div className="mb-5">
          <p className="form__label">Time Slots</p>
          {formData.timeSlots?.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="grid grid-cols-3 gap-5">
                <div>
                  <p className="form__label">Day</p>
                  <select
                    name="day"
                    value={item.day}
                    onChange={(e) => handleTimeSlotChange(index, e)}
                    className="form__input py-3.5"
                  >
                    <option value="">Select</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <p className="form__label">Starting Time</p>
                  <input
                    className="form__input"
                    type="time"
                    name="startingTime"
                    value={item.startingTime}
                    onChange={(e) => handleTimeSlotChange(index, e)}
                  />
                </div>
                <div>
                  <p className="form__label">Ending Time</p>
                  <input
                    className="form__input"
                    type="time"
                    name="endingTime"
                    value={item.endingTime}
                    onChange={(e) => handleTimeSlotChange(index, e)}
                  />
                </div>
              </div>
              <button
                className="bg-red-500 text-white p-2 rounded mt-3"
                type="button"
                onClick={() => deleteTimeSlot(index)}
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
          <button
            className="bg-blue-500 text-white p-2 rounded mt-3"
            type="button"
            onClick={addTimeSlot}
          >
            Add Time Slot
          </button>
        </div>
        <div className="mb-5">
          <p className="form__label">Upload Photo</p>
          <input
            className="form__input"
            type="file"
            onChange={handlePhotoInputChange}
          />
          {previewPhotoUrl && <img src={previewPhotoUrl} alt="Photo Preview" />}
          </div>
        <div className="mb-5">
          <p className="form__label">Upload Signature</p>
          <input
            className="form__input"
            type="file"
            onChange={handleSignatureInputChange}
          />
          {previewSignatureUrl && <img src={previewSignatureUrl} alt="Signature Preview" />} 
          </div>
        <button className="bg-primaryColor text-white py-3 px-6 rounded-lg w-full mt-5">Update Profile</button>
      </form>
    </div>
  )
};

export default Profile;
