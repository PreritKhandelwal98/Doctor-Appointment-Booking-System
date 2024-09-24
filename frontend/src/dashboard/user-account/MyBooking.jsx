import useFetchData from "../../hooks/userFetchData";
import { BASE_URL } from "../../utils/config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { useContext } from "react";
import { authContext } from "../../context/authContext";

const MyBooking = () => {
  const userData = useContext(authContext);
  const { user } = userData || {}; // Fallback to empty object if userData is null
  
  const userId = user?._id || '';
  const { data: response, loading, error } = useFetchData(`${BASE_URL}/user/appointments/my-appointments/${userId}`);
  
  // Ensure the data is in the expected format
  const appointments = response?.data || []; // Use 'appointments' to reflect the data better

  return (
    <div className="mt-10">
      {loading && !error && <Loading />}
      {error && !loading && <Error errorMessage={error} />}
      {!loading && !error && Array.isArray(appointments) && appointments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {appointments.map(appointment => (
            <div key={appointment._id} className="border p-4 rounded-md shadow">
              <h3 className="text-lg font-semibold">
                Doctor: {appointment.doctor.name}
              </h3>
              <p>Appointment Date: {new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p>Time: {appointment.startTime} - {appointment.endTime}</p>
              <p>Status: {appointment.status || 'Confirmed'}</p> {/* Assuming there's a status field */}
            </div>
          ))}
        </div>
      )}
      {!loading && !error && (!appointments || !Array.isArray(appointments) || appointments.length === 0) && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          You did not book any doctor yet!
        </h2>
      )}
    </div>
  );
}

export default MyBooking;
