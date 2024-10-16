import { useContext } from "react";
import { toast } from 'react-toastify';
import { authContext } from "../../context/authContext";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useGetProfile from "../../hooks/userFetchData";
import { BASE_URL } from "../../utils/config";

// Icon for PDF download (using Font Awesome)
import { FaFilePdf } from 'react-icons/fa';

const MyPrescription = () => {
  const userData = useContext(authContext);
  const user = userData?.user;

  // Fetch prescriptions from the API
  const { data, loading, error } = useGetProfile(`${BASE_URL}/prescription/patient/get-prescription/${user._id}`);
  
  // Extract prescriptions array from the data
  const prescriptionData = data?.prescriptions || [];

  // Simulate prescription download
  const handleDownloadPrescription = (prescriptionId) => {
    // Add logic to download prescription by prescriptionId
    toast.success(`Downloading prescription with ID: ${prescriptionId}`);
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && prescriptionData.length > 0 ? (
          <div className="grid lg:grid-cols-1 gap-[50px]">
            <div className="mt-8">
              <table className="w-full text-left text-sm text-gray-500 border-separate border-spacing-y-2">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">Doctor Name</th>
                    <th scope="col" className="px-6 py-3">Prescription Date</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptionData.map((prescription) => (
                    <tr key={prescription._id} className="bg-white border border-gray-200 shadow-sm rounded-lg">
                      {/* Doctor's Name */}
                      <td className="px-6 py-4">
                        <div className="text-base font-semibold">{prescription?.doctorId?.name}</div>
                      </td>

                      {/* Prescription Generated Date */}
                      <td className="px-6 py-4">
                        {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {/* Download PDF Button */}
                          <button
                            onClick={() => handleDownloadPrescription(prescription._id)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                          >
                            <FaFilePdf /> Download Prescription
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
          <div className="text-center text-gray-500 mt-10">No Prescriptions Available</div>
        )}
      </div>
    </section>
  );
};

export default MyPrescription;
