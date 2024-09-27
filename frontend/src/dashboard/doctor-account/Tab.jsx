import { useContext } from 'react';
import { BiMenu } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { authContext } from '../../context/authContext';

const Tab = ({ tab, setTab }) => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <div>
      {/* Flex layout for responsive buttons */}
      <div className="flex flex-row lg:flex-col p-[20px] lg:p-[30px] bg-white shadow-panelShadow items-center justify-between lg:justify-start h-max rounded-md">
        <button
          onClick={() => setTab('overview')}
          className={`${
            tab === 'overview' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'
          } btn w-full lg:w-auto px-4 lg:mt-0 rounded-md`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('appointments')}
          className={`${
            tab === 'appointments' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'
          } btn w-full lg:w-auto px-4 lg:mt-0 rounded-md`}
        >
          Appointments
        </button>
        <button
          onClick={() => setTab('virtualappointment')}
          className={`${
            tab === 'virtualappointment' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'
          } btn w-full lg:w-auto px-4 lg:mt-0 rounded-md`}
        >
          Virtual Appointments
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`${
            tab === 'settings' ? 'bg-indigo-100 text-primaryColor' : 'bg-transparent text-headingColor'
          } btn w-full lg:w-auto px-4 lg:mt-0 rounded-md`}
        >
          Profile
        </button>

        {/* Logout and Delete Account Buttons */}
        <div className="mt-5 lg:mt-[100px] w-full flex flex-col space-y-4 lg:space-y-0 lg:space-x-0">
          <button
            className="w-full bg-[#181A1E] p-3 text-[16px] leading-7 rounded-md text-[#fff]"
            onClick={handleLogout}
          >
            Logout
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default Tab;
