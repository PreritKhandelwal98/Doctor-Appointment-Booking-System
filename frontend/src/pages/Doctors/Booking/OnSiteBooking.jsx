import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { BASE_URL, token } from './../../../utils/config';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import HashLoader from 'react-spinners/HashLoader';
import convertTime from './../../../utils/convertTime';
import { authContext } from '../../../context/authContext';

// Function to generate 30-minute intervals from a given start and end time
const generateTimeSlots = (startingTime, endingTime) => {
  const start = new Date(`1970-01-01T${startingTime}:00`);
  const end = new Date(`1970-01-01T${endingTime}:00`);
  const timeSlots = [];

  while (start < end) {
    const endSlot = new Date(start.getTime() + 30 * 60000); // Add 30 minutes
    if (endSlot > end) break; // Ensure we don't go beyond the end time
    timeSlots.push({
      startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    start.setTime(start.getTime() + 30 * 60000); // Move to the next slot
  }
  return timeSlots;
};

// Function to get the weekday from a date
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const OnSiteBooking = ({ doctorId, ticketPrice, timeSlots }) => {
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', startTime: '', endTime: '', appointmentDate: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState({});
  const [disabledSlots, setDisabledSlots] = useState([]); 
  const [availableSlots, setAvailableSlots] = useState([]);
  const navigate = useNavigate();

  const userData = useContext(authContext);
  const { user } = userData || {}; // Fallback to empty object if userData is null
  const role = user?.role || 'No role';

  useEffect(()=>{
    if(user){
      setUserDetails((prevDetails)=>({
        ...prevDetails,
        name:user?.name || 'Guest',
        email:user?.email || 'No Email'
      }))
    }
  },[user])

  useEffect(() => {
    // Fetch the already booked time slots when a date is selected
    const fetchDisabledSlots = async () => {
      if (!selectedDate) return; // Do not fetch if no date is selected

      try {
        const res = await fetch(`${BASE_URL}/bookings/booked-slots/${doctorId}?date=${selectedDate}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        
        if (res.ok) {
          // Convert bookedSlots to 24-hour format for easier comparison
          const convertedBookedSlots = data.bookedSlots.map(slot => ({
            startTime: convertTo24Hour(slot.startTime),
            endTime: convertTo24Hour(slot.endTime),
          }));
          setDisabledSlots(convertedBookedSlots);
        } else {
          throw new Error(data.message || 'Failed to fetch booked slots');
        }
      } catch (error) {
        toast.error('Error fetching booked slots: ' + error.message);
      }
    };

    fetchDisabledSlots();
  }, [doctorId, selectedDate]);

  useEffect(() => {
    // Generate 30-minute interval slots for all available time slots
    let slots = [];
    timeSlots.forEach(slot => {
      const dailySlots = generateTimeSlots(slot.startingTime, slot.endingTime);
      dailySlots.forEach(interval => {
        slots.push({ ...interval, day: slot.day });
      });
    });
    setAvailableSlots(slots);
  }, [timeSlots]);

  // Sync selectedDate with appointmentDate in userDetails
  useEffect(() => {
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      appointmentDate: selectedDate,
    }));
  }, [selectedDate]);

  // Filter available slots based on selected date's weekday
  const filteredSlots = selectedDate
    ? availableSlots.filter(slot => slot.day === getDayOfWeek(selectedDate))
    : [];

  // Function to check if a slot is disabled
  const isDisabled = (slot) => {
    const slotStartTime24 = convertTo24Hour(slot.startTime);
    return disabledSlots.some(
      disabledSlot => disabledSlot.startTime === slotStartTime24
    );
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingSubmit = async () => {
    if (role !== 'patient') {
      toast.error('Only patients can book an appointment.');
      return;
    }

    if (!selectedTimeSlot.startTime || !selectedTimeSlot.endTime) {
      toast.error('Please select a time slot');
      return;
    }
    if (!userDetails.name || !userDetails.email || !userDetails.appointmentDate) {
      toast.error('Please fill in all user details');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/bookings/checkout/razorpay/${doctorId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeSlot: selectedTimeSlot,
          user: userDetails,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message + ' Please try again later');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Medicare',
        description: 'Test Transaction',
        image: 'https://your-logo-url.com/logo.png',
        order_id: data.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${BASE_URL}/bookings/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              toast.success('Payment successful!');
              navigate('/checkout-success');
            } else {
              toast.error('Payment verification failed. Please try again.');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            toast.error('Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        notes: {
          address: 'Medicare',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Error during booking:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle time slot selection
  const handleTimeSlotSelect = (slot) => {
    const convertedStartTime = convertTo24Hour(slot.startTime);
    const startTime = new Date(`1970-01-01T${convertedStartTime}:00`);
    const endTime = new Date(startTime.getTime() + 30 * 60000); // Adding 30 minutes

    if (!startTime.getTime() || !endTime.getTime()) {
      toast.error('Invalid time selected. Please try again.');
      return;
    }

    // Format start and end time as strings (HH:mm)
    const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSelectedTimeSlot({
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    });

    // Update userDetails with startTime and endTime
    setUserDetails((prev) => ({
      ...prev,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    }));
  };

  const convertTo24Hour = (time) => {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12; // Convert PM hours to 24-hour format
    } else if (modifier === 'AM' && hours === '12') {
      hours = '00'; // Convert midnight to 00:00
    }
    return `${hours}:${minutes}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text__para">Consultation Fee: <span className="font-semibold text-headingColor">₹{ticketPrice}</span></p>
      </div>

      <div className="mt-5">
        <label htmlFor="bookingDate" className="block text-sm text-textColor">Select Date</label>
        <input
          type="date"
          id="bookingDate"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <ul className="mt-3 flex flex-wrap gap-2">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot, index) => (
            <li key={index} className="flex items-center justify-between mb-2">
              <button
                onClick={() => handleTimeSlotSelect(slot)} 
                className={`text-[15px] leading-6 text-textColor font-semibold px-4 py-2 rounded-md ${
                  isDisabled(slot) ? 'bg-gray-300 cursor-not-allowed' : 'bg-primaryColor text-white'
                }`}
                disabled={isDisabled(slot)} // Disable based on the condition
              >
                {convertTime(slot.startTime)}
              </button>
            </li>
          ))
        ) : (
          <p className="text__para text-red-500">No available slots for the selected date.</p>
        )}
      </ul>

      {/* Display the selected time slot */}
      {selectedTimeSlot.startTime && (
        <div className="mt-5">
          <p className="text__para">Selected Time Slot: {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}</p>
        </div>
      )}

      <div className="mt-5">
        <label htmlFor="name" className="block text-sm text-textColor">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={userDetails.name}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="email" className="block text-sm text-textColor">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={userDetails.email}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <button
        className={`mt-5 w-full py-2 px-4 rounded-md text-white bg-primaryColor hover:bg-primaryDarkColor transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
        onClick={handleBookingSubmit}
      >
        {loading ? (
          <HashLoader size={20} color="#ffffff" />
        ) : (
          'Book Appointment'
        )}
      </button>
    </div>
  );
};

OnSiteBooking.propTypes = {
  doctorId: PropTypes.string.isRequired,
  ticketPrice: PropTypes.number.isRequired,
  timeSlots: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      startingTime: PropTypes.string.isRequired,
      endingTime: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default OnSiteBooking;
