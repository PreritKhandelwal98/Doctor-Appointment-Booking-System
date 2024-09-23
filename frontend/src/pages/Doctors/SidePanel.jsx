import { useState } from 'react';
import Modal from 'react-modal';
import convertTime from './../../utils/convertTime'; // Keep your utility imports
import OnSiteBooking from './Booking/OnSiteBooking';
import VirtualBooking from './Booking/VirtualBooking';

// Set up the modal's app element for accessibility
Modal.setAppElement('#root');

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(''); // Track what content to show in the modal
  
  const openModal = (contentType) => {
    setModalIsOpen(true);
    setModalContent(contentType); // Set content based on which button was clicked
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalContent(''); // Clear modal content on close
  };

  const renderModalContent = () => {
    switch (modalContent) {
      case 'onsite':
        return (
          <OnSiteBooking doctorId={doctorId} ticketPrice={ticketPrice} timeSlots={timeSlots}/>
        );
      case 'virtual':
        return (
          <VirtualBooking/>
        );
      default:
        return null;
    }
  };

  return (
    <div className="shadow-panelShadow p-3 lg:p-5 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Ticket Price</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold ml-2">₹ {ticketPrice} </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">
          Available Time Slot:
        </p>

        <ul className="mt-3">
          {timeSlots?.map((item, index) => (
            <li key={index} className="flex items-center justify-between mb-2">
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {item.day.charAt(0).toUpperCase() + item.day.slice(1)}
              </p>
              <p className="text-[15px] leading-6 text-textColor font-semibold">
                {convertTime(item.startingTime)} - {convertTime(item.endingTime)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between gap-2 mt-4">
        <button 
          onClick={() => openModal('onsite')} 
          className="btn px-2 w-full rounded-md bg-primaryColor text-white"
        >
          Book Onsite Appointment
        </button>

        <button 
          onClick={() => openModal('virtual')} 
          className="btn px-2 w-full rounded-md bg-green-500 text-white"
        >
          Book Virtual Appointment
        </button>
      </div>

      {/* Modal Component */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            width: '100%',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        {/* Modal Content */}
        {renderModalContent()}

        {/* Close button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={closeModal}
            className="btn bg-gray-400 text-white px-4 py-2"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SidePanel;
