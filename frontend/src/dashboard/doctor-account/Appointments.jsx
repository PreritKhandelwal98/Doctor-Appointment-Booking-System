import { useState } from 'react';
import { BASE_URL,token } from "../../utils/config";
import { toast } from 'react-toastify';


const Appointments = ({ appointments }) => {
  const [appointmentData, setAppointmentData] = useState(appointments);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/bookings/appointment/change-status/${id}`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state to reflect the change
      if(newStatus==='approved'){
        toast.success("Appointment Approved")
      }else{
        toast.error("Appointment Cancelled")
      }
      setAppointmentData(appointmentData.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <table className="w-full text-left text-sm text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3">Name</th>
          <th scope="col" className="px-6 py-3">Gender</th>
          <th scope="col" className="px-6 py-3">Email</th>
          <th scope="col" className="px-6 py-3">Payment</th>
          <th scope="col" className="px-6 py-3">Price</th>
          <th scope="col" className="px-6 py-3">Booked on</th>
          <th scope="col" className="px-6 py-3">Status</th>
          <th scope="col" className="px-6 py-3">Actions</th>
        </tr>
      </thead>

      <tbody>
        {appointmentData?.map(item => (
          <tr key={item._id}>
            
            <td className="px-6 py-4">
              <div className="text-base font-semibold">{item.user?.name}</div>
            </td>
            <td className="px-6 py-4">{item.user?.gender}</td>
            <td className="px-6 py-4">{item.user?.email}</td>
            <td className="px-6 py-4">
              {item.isPaid ? (
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                  Paid
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></div>
                  UnPaid
                </div>
              )}
            </td>
            <td className="px-6 py-4">{item.ticketPrice}</td>
            <td className="px-6 py-4">{item.appointmentDate}</td>
            <td className="px-6 py-4">{item.status}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange(item._id, 'approved')} 
                  className="px-2 py-1 bg-green-500 text-white rounded"
                >
                  Approve
                </button>
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
  );
};

export default Appointments;
