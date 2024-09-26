import { useParams, useLocation } from "react-router-dom";

const VirtualMeeting = () => {
  const { id } = useParams(); // Get the appointment ID from the URL
  const location = useLocation(); // Get the location object which contains the state
  const { appointment } = location.state || {}; // Extract appointment from the state

  return (
    <div>
      <h1>Virtual Meeting for Appointment ID: {id}</h1>
      {appointment ? (
        <div>
          <p>Patient Name: {appointment.user?.name}</p>
          <p>Appointment Time: {appointment.startTime} - {appointment.endTime}</p>
          {/* Display other appointment details */}
        </div>
      ) : (
        <p>No appointment data available.</p>
      )}
    </div>
  );
};

export default VirtualMeeting;
