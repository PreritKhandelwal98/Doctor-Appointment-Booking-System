import { useState } from "react";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useGetProfile from "../../hooks/userFetchData";
import { BASE_URL } from "../../utils/config";
import Tab from "./Tab";
import starIcon from '../../assets/images/Star.png';
import DoctorAbout from "./DoctorAbout";
import Profile from "./Profile";
import Appointments from "./Appointments";
import VirtualAppointment from "./VirtualAppointment";

const Dashboard = () => {
  const { data, loading, error } = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const [tab, setTab] = useState('overview');

  const doctor = data?.data?.doctor;
  const appointments = data?.data?.appointments || [];
  const isApproved = doctor?.isApproved === 'approved';

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-[50px]">
            <Tab tab={tab} setTab={setTab} />
            <div className="lg:col-span-2">
              {!loading && !error && doctor && (
                !isApproved && (
                  <div className="flex p-4 mb-4 text-yellow-800 bg-yellow-50 rounded-lg" role="alert">
                    <svg 
                      aria-hidden="true" 
                      className="flex-shrink-0 w-5 h-5" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <span className="sr-only">Info</span>
                    <div className="ml-3 text-sm font-medium">
                      To get approval, please complete your profile. We&apos;ll review it manually and approve within 3 days.
                    </div>
                  </div>
                )
              )}

              <div className="mt-8">
                {tab === 'overview' && doctor && (
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <figure>
                        <img src={doctor.photo} alt="Doctor" className="w-full"/>
                      </figure>
                      <div>
                        <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 lg:py-2 lg:px-6 rounded text-[12px] leading-4 lg:text-[16px] lg:leading-6 font-semibold">
                          {doctor.specialization}
                        </span>
                        <h3 className="text-[22px] leading-9 font-bold text-headingColor mt-3">
                          {doctor.name}
                        </h3>
                        <div className="flex items-center gap-[6px]">
                          <span className="flex items-center gap-[6px] text-headingColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold">
                            <img src={starIcon} alt="Rating" /> {doctor.averageRating}
                          </span>
                          <span className="flex items-center gap-[6px] text-textColor text-[14px] leading-5 lg:text-[16px] lg:leading-6 font-semibold">
                            ({doctor.totalRating})
                          </span>
                        </div>
                        <p className="text__para font-[15px] lg:mx-w-[390] leading-6">
                          {doctor.bio}
                        </p>
                      </div>
                    </div>
                    <DoctorAbout 
                      name={doctor.name} 
                      about={doctor.about} 
                      qualifications={doctor.qualifications} 
                      experiences={doctor.experiences}
                    />
                  </div>
                )}
                {tab === 'appointments' && (
                  <Appointments appointments={appointments} />
                )}
                {tab === 'virtualappointment' && doctor && (
                  <VirtualAppointment appointments={appointments}/>
                )}
                {tab === 'settings' && doctor && (
                  <Profile doctorData={data} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
