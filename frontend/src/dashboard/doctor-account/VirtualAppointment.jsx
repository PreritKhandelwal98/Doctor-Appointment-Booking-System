import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { BASE_URL, token } from "../../utils/config";
import { toast } from 'react-toastify';

const VirtualAppointment = ({ appointments }) => {
  const [appointmentData, setAppointmentData] = useState(appointments);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  // Handle status change function
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/bookings/appointment/change-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      if (newStatus === 'approved') {
        toast.success("Appointment Approved");
      } else if(newStatus === 'cancelled') {
        toast.error("Appointment Cancelled");
      }

      setAppointmentData(appointmentData.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle meeting start and navigate to the VirtualMeeting page
  const handleMeetingStart = (appointment) => {
    toast.info("Consultancy Started");
    
    // Navigate to the VirtualMeeting component with appointmentId as a param
    navigate(`/appointments/virtual`);
  };

  // Filter only virtual appointments
  const virtualAppointments = appointmentData.filter(item => item.appointmentType === 'virtual');

  // If no virtual appointments, show a message
  if (virtualAppointments.length === 0) {
    return <p className="text-center text-gray-500">No virtual appointments booked.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {virtualAppointments.map(item => (
          <div key={item._id} className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">{item.user?.name}</h3>
              <p className="text-gray-500">{item.user?.email}</p>
              <p className="text-gray-500">Gender: {item.user?.gender}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                {item.isPaid ? (
                  <span className="text-green-500 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-500 font-semibold">UnPaid</span>
                )}
              </div>
              <p className="text-gray-500">Price: ₹{item.ticketPrice}</p>
              <p className="text-gray-500">Booked for: {item.appointmentDate}</p>
              <p className="text-gray-500">Timing: {item.startTime}-{item.endTime}</p>
            </div>

            <div className="mb-4">
              <p className={`text-sm font-semibold ${item.status === 'approved' ? 'text-green-500' : item.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}`}>
                Status: {item.status}
              </p>
            </div>

            <div className="flex justify-between mt-4">
              {item.status === 'approved' ? (
                <>
                  <button
                    onClick={() => handleMeetingStart(item)} // Start the meeting and navigate
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => handleStatusChange(item._id, 'cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleStatusChange(item._id, 'approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(item._id, 'cancelled')}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualAppointment;
