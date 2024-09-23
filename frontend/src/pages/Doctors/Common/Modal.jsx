// import convertTime from './../../utils/convertTime';
// import { BASE_URL, token } from './../../utils/config';
// import { toast } from 'react-toastify';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; 
// import HashLoader from 'react-spinners/HashLoader';

// const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
//   const [loading, setLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
//   const [modalContentType, setModalContentType] = useState(''); // State for modal content type
//   const navigate = useNavigate(); 

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement('script');
//       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//       script.onload = () => {
//         resolve(true);
//       };
//       script.onerror = () => {
//         console.error('Failed to load Razorpay script');
//         resolve(false);
//       };
//       document.body.appendChild(script);
//     });
//   };

//   const bookingHandler = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${BASE_URL}/bookings/checkout/razorpay/${doctorId}`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.message + ' Please try again later');
//       }

//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         throw new Error('Razorpay SDK failed to load. Are you online?');
//       }

//       const options = {
//         key: import.meta.env.RAZORPAY_KEY_ID, 
//         amount: data.order.amount,
//         currency: data.order.currency,
//         name: 'Medicare',
//         description: 'Test Transaction',
//         image: 'https://your-logo-url.com/logo.png',
//         order_id: data.order.id,
//         handler: async function (response) {
//           try {
//             const verifyRes = await fetch(`${BASE_URL}/bookings/verify-payment`, {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json'
//               },
//               body: JSON.stringify({
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_signature: response.razorpay_signature
//               })
//             });

//             const verifyData = await verifyRes.json();
//             if (verifyRes.ok && verifyData.success) {
//               toast.success('Payment successful!');
//               navigate('/checkout-success');
//             } else {
//               toast.error('Payment verification failed. Please try again.');
//             }
//           } catch (error) {
//             console.error('Error verifying payment:', error);
//             toast.error('Payment verification failed. Please try again.');
//           }
//         },
//         prefill: {
//           name: data.user.name,
//           email: data.user.email,
//         },
//         notes: {
//           address: 'Medicare',
//         },
//         theme: {
//           color: '#3399cc',
//         },
//       };

//       const paymentObject = new window.Razorpay(options);
//       paymentObject.open();
//     } catch (err) {
//       console.error('Error during booking:', err);
//       toast.error(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handler for Virtual Appointment
//   const bookVirtualAppointment = () => {
//     setModalContentType('virtual');
//     setIsModalOpen(true);
//   };

//   // Handler for Onsite Appointment
//   const openOnsiteAppointmentModal = () => {
//     setModalContentType('onsite');
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="shadow-panelShadow p-3 lg:p-5 rounded-md">
//       <div className="flex items-center justify-between">
//         <p className="text__para mt-0 font-semibold">Ticket Price</p>
//         <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold ml-2">₹ {ticketPrice} </span>
//       </div>

//       <div className="mt-[30px]">
//         <p className="text__para mt-0 font-semibold text-headingColor">
//           Available Time Slot:
//         </p>

//         <ul className="mt-3">
//           {timeSlots?.map((item, index) => (
//             <li key={index} className="flex items-center justify-between mb-2">
//               <p className="text-[15px] leading-6 text-textColor font-semibold">{item.day.charAt(0).toUpperCase() + item.day.slice(1)}</p>
//               <p className="text-[15px] leading-6 text-textColor font-semibold">
//                 {convertTime(item.startingTime)} - {convertTime(item.endingTime)}
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="flex justify-between gap-2 mt-4">
//         <button 
//           onClick={openOnsiteAppointmentModal} 
//           className="btn px-2 w-full rounded-md" 
//           disabled={loading}
//         >
//           {loading ? <HashLoader size={24} color="#fff" /> : 'Book Onsite Appointment'}
//         </button>
        
//         <button 
//           className="btn px-2 w-full rounded-md bg-green-500 text-white"
//           onClick={bookVirtualAppointment}
//         >
//           {loading ? <HashLoader size={24} color="#fff" /> : 'Book Virtual Appointment'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SidePanel;
