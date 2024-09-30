import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { BASE_URL, token } from "../../../utils/config";
import { toast } from 'react-toastify';
import io from 'socket.io-client'; // Assuming you're using socket.io-client

const VirtualAppointment = ({ appointments }) => {
  const [appointmentData, setAppointmentData] = useState(appointments);
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const socket = useRef(null); // Ref to store the socket connection

  // Initialize socket connection when the component mounts
  useEffect(() => {
    // Initialize the socket connection
    socket.current = io('http://localhost:5600/', {
      query: { token: token }, // Pass token as query param (if needed for authentication)
    });

    // Attach the "room:join" listener once socket is connected
    socket.current.on('connect', () => {
      console.log('Connected to socket');
    });

    return () => {
      // Clean up socket connection when the component unmounts
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []); // Run this effect only once, on component mount

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
      } else if (newStatus === 'cancelled') {
        toast.error("Appointment Cancelled");
      }

      setAppointmentData(appointmentData.map(item =>
        item._id === id ? { ...item, status: newStatus } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Handle meeting start and emit socket event
  const handleMeetingStart = useCallback(
    (appointment) => {
      console.log('Starting meeting for appointment:', appointment._id);
      
      if (socket.current) {
        // Emit the "room:join" event with the appointment ID as room
        socket.current.emit("room:join", { room: appointment._id });
        console.log("Socket event emitted for room:", appointment._id);
      } else {
        console.error("Socket is not connected");
      }
    },
    []
  );

  // Handle when the user joins the room
  const handleJoinRoom = useCallback(
    (data) => {
      console.log("Room joined with data:", data);
      const { room } = data; // The room here is the appointment ID

      // Navigate to the VirtualMeeting component with appointmentId as a param
      const appointment = appointmentData.find(app => app._id === room);
      if (appointment) {
        navigate(`/appointments/virtual/${room}`, {
          state: {
            appointment
          }
        });
        console.log("Navigating to /appointments/virtual with room ID:", room);
      } else {
        console.error("No appointment found for room:", room);
      }
    },
    [navigate, appointmentData]
  );

  // Attach socket event listener for "room:join"
  useEffect(() => {
    if (socket.current) {
      socket.current.on("room:join", handleJoinRoom);
    }

    return () => {
      if (socket.current) {
        socket.current.off("room:join", handleJoinRoom); // Clean up the event listener
      }
    };
  }, [handleJoinRoom]);

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
                    onClick={() => handleMeetingStart(item)} // Start the meeting and emit socket event
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
