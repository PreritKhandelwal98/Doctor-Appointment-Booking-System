import { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useGetProfile from "../../hooks/userFetchData";
import { BASE_URL, token } from "../../utils/config";
import Tab from "./Tab";
import Profile from "./Profile";
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { data, loading, error } = useGetProfile(`${BASE_URL}/doctors/all-doctor/list`);
  const [tab, setTab] = useState('approval_request');
  const doctor = data?.data || [];

  // State to manage the doctor data locally
  const [doctorData, setDoctorData] = useState([]);

  const loggedInAdmin = JSON.parse(localStorage.getItem('user')); // Parse the user data
  const { _id: adminId } = loggedInAdmin || {}; // Extract _id from the logged-in admin object
  console.log("Admin ID:", adminId); 
  

  // When data is fetched, update doctorData
  useEffect(() => {
    if (doctor.length > 0) {
      setDoctorData(doctor);
    }
  }, [doctor]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/doctors/change-status/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Show toast notifications
      if (newStatus === 'approved') {
        toast.success("Doctor Approved for Operation");
      } else {
        toast.error("Doctor Cancelled for Operation");
      }

      // Immediately update the local state to reflect the status change
      setDoctorData(doctorData.map(item =>
        item._id === id ? { ...item, isApproved: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-[50px]">
            <Tab tab={tab} setTab={setTab} />
            <div className="lg:col-span-2">
              <div className="mt-8">
                {tab === 'approval_request' && doctorData.length > 0 ? (
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Name</th>
                        <th scope="col" className="px-6 py-3">Gender</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {doctorData.map(item => (
                        <tr key={item._id}>
                          <td className="px-6 py-4">
                            <div className="text-base font-semibold">{item?.name}</div>
                          </td>
                          <td className="px-6 py-4">{item?.gender}</td>
                          <td className="px-6 py-4">{item?.email}</td>
                          <td className="px-6 py-4">{item?.isApproved}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {/* Conditionally render the approve button if the status is not 'approved' */}
                              {item.isApproved !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(item._id, 'approved')}
                                  className="px-2 py-1 bg-green-500 text-white rounded"
                                >
                                  Approve
                                </button>
                              )}
                              {/* Cancel button is always shown */}
                              <button
                                onClick={() => handleStatusChange(item._id, 'cancelled')}
                                className="px-2 py-1 bg-red-500 text-white rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No Doctors Found</div>
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
