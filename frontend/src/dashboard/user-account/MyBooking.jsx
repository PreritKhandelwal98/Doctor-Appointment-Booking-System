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
  
  // Check if there are no appointments (or the response indicates no appointments)
  const noAppointments = response?.success === false && response?.message === 'No appointments found for this user.';

  // Ensure the data is in the expected format
  const appointments = response?.data || [];

  return (
    <div className="mt-10">
      {loading && !error && <Loading />}
      
      {/* Critical error handling */}
      {error && !loading && <Error errorMessage={error} />}

      {/* No appointments found (handle specific 'no appointments' message) */}
      {!loading && !error && noAppointments && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          No bookings available.
        </h2>
      )}

      {/* Display the list of appointments if available */}
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
              <p>Status: {appointment.appointmentType || 'none'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Handle the case where there are no appointments in the data */}
      {!loading && !error && (!appointments || appointments.length === 0) && !noAppointments && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          No bookings available.
        </h2>
      )}
    </div>
  );
}

export default MyBooking;
