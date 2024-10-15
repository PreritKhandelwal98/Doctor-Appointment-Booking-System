import { useContext, useState, useEffect } from 'react';
import { authContext } from '../../context/authContext';
import MyBooking from './MyBooking';
import Profile from './Profile';
import MyPrescription from './MyPrescription'
import useGetProfile from '../../hooks/userFetchData';
import { BASE_URL } from '../../utils/config';
import Loading from '../../components/Loader/Loading';
import Error from '../../components/Error/Error';
import { useNavigate } from 'react-router-dom';

const MyAccount = () => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate('/login'); // Redirect to login after logout
  };

  const { data: userData, loading, error } = useGetProfile(`${BASE_URL}/user/profile/me`);

  // If token is missing or there’s an authentication error, redirect to login
  useEffect(() => {
    if (error === "No authentication token found. Please log in.") {
      navigate('/login'); // Redirect to login page if there's no token
    }
  }, [error, navigate]);

  // Handle undefined userData gracefully
  const userPhoto = userData?.data?.photo || '/default-photo.png';
  const userName = userData?.data?.name || 'No Name Available';
  const userEmail = userData?.data?.email || 'No Email Available';
  const userBloodType = userData?.data?.bloodType || 'N/A';

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && <Loading />}
        {error && !loading && <Error errorMessage={error} />}
        {!loading && !error && userData && (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="pb-[50px] px-[30px] rounded-md">
              <div className="flex items-center justify-center">
                <figure className="w-[100px] h-[100px] rounded-full border-2 border-solid border-primaryColor">
                  <img
                    src={userPhoto} // Use a default photo if none is available
                    alt="User Photo"
                    className="w-full h-full rounded-full"
                  />
                </figure>
              </div>
              <div className="text-center mt-4">
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold">{userName}</h3>
                <p className="text-textColor text-[15px] leading-6 font-medium">{userEmail}</p>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  Blood Type: <span className="ml-2 text-headingColor text-[22px] leading-8">{userBloodType}</span>
                </p>
              </div>
              <div className="mt-[50px] md:mt-[100px]">
                <button
                  className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-[#fff]"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="md:col-span-2 md:px-[30px]">
            <div>
              <button
                onClick={() => setTab('bookings')}
                className={`${
                  tab === 'bookings' ? 'bg-primaryColor text-white font-normal' : 'text-headingColor'
                } p-2 mr-5 px-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
              >
                My Booking
              </button>
  
              <button
                onClick={() => setTab('prescription')}
                className={`${
                  tab === 'prescription' ? 'bg-primaryColor text-white font-normal' : 'text-headingColor'
                } py-2 px-5 mr-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
              >
                My Prescription
              </button>

              <button
                onClick={() => setTab('settings')}
                className={`${
                  tab === 'settings' ? 'bg-primaryColor text-white font-normal' : 'text-headingColor'
                } py-2 px-5 rounded-md text-[16px] leading-7 border border-solid border-primaryColor`}
              >
                Profile Setting
              </button>
            </div>

              {/* Conditionally render components based on the active tab */}
              {tab === 'bookings' && <MyBooking />}
              {tab === 'prescription' && <MyPrescription/>} 
              {tab === 'settings' && <Profile user={userData} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
