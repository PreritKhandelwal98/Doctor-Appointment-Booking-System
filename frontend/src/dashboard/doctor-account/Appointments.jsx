import { useState } from 'react';
import { BASE_URL } from "../../utils/config";
import { toast } from 'react-toastify';

const Appointments = ({ appointments }) => {
  
  const [appointmentData, setAppointmentData] = useState(appointments);
  const token = localStorage.getItem('token')
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

      // Update local state to reflect the change
      if (newStatus === 'approved') {
        toast.success("Appointment Approved");
      } else {
        toast.error("Appointment Cancelled");
      }

      setAppointmentData(appointmentData.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filter only onsite appointments
  const onsiteAppointments = appointmentData.filter(item => item.appointmentType === 'onsite');

  return (
    <div>
      {/* Check if there are no onsite appointments */}
      {onsiteAppointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments booked.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {onsiteAppointments.map(item => (
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
