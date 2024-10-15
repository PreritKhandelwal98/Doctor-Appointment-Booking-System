import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useGetProfile from "../../hooks/userFetchData";
import { BASE_URL } from "../../utils/config";
import { toast } from 'react-toastify';

const MyPrescription = () => {
  const { data: doctorData, loading, error } = useGetProfile(`${BASE_URL}/doctors/all-doctor/list`);

  // Simulate prescription download
  const handleDownloadPrescription = (doctorId) => {
    // Add logic to download prescription by doctorId
    toast.success(`Downloading prescription for doctor ID: ${doctorId}`);
  };

  const handleStatusChange = (doctorId, newStatus) => {
    // Logic to handle the status change (approve or cancel)
    toast.info(`Changing status of doctor ID: ${doctorId} to ${newStatus}`);
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && doctorData && doctorData.length > 0 ? (
          <div className="grid lg:grid-cols-1 gap-[50px]">
            <div className="mt-8">
              <table className="w-full text-left text-sm text-gray-500 border-separate border-spacing-y-2">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Gender</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Specialization</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {doctorData.map((item) => (
                    <tr key={item._id} className="bg-white border border-gray-200 shadow-sm rounded-lg">
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold">{item?.name}</div>
                      </td>
                      <td className="px-6 py-4">{item?.gender}</td>
                      <td className="px-6 py-4">{item?.email}</td>
                      <td className="px-6 py-4">{item?.specialization || 'N/A'}</td>
                      <td className="px-6 py-4">{item?.isApproved ? 'Approved' : 'Pending'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {/* Approve/Cancel Buttons */}
                          {item.isApproved !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(item._id, 'approved')}
                              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleStatusChange(item._id, 'cancelled')}
                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Cancel
                          </button>
                          {/* Download Prescription Button */}
                          <button
                            onClick={() => handleDownloadPrescription(item._id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            Download Prescription
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">No Prescription Available</div>
        )}
      </div>
    </section>
  );
};

export default MyPrescription;
