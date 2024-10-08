import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import logoUrl from './../../../assets/images/logo.png';
import { BASE_URL } from "../../../utils/config";
import { toast } from 'react-toastify';

const Prescription = ({ user, appointment }) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [qrCode, setQrCode] = useState(''); // Placeholder for QR Code
  const doctorSignature = user.signature;
  // Function to add more medicines
  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  // Handle input change for medicines
  const handleInputChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };

  // Handle input change for allergies
  const handleAllergyChange = (event) => {
    setAllergies(event.target.value); // Store allergies as a comma-separated string
  };

  // Function to save the prescription details in the database
  const handlePrescriptionData = async () => {
    const prescriptionDetails = {
      doctorId: user._id, // Assuming user has an _id field for doctorId
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientId: appointment.user._id, // Assuming appointment.user has an _id field for patientId
      prescriptionDetails: notes, // Store notes in prescriptionDetails
      medication: medicines,
      allergies: allergies.split(',').map(allergy => allergy.trim()), // Convert string to array
      followUpDate,
      qrCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(`${BASE_URL}/bookings/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionDetails),
      });

      if (response.ok) {
        toast.success('Prescription data saved and sent successfully!');
        generatePDF(); // Call PDF generation here if needed
      } else {
        throw new Error('Error saving prescription.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to generate PDF
  const generatePDF = () => {
    const element = document.getElementById("prescription-content");
    html2pdf()
      .from(element)
      .save(`Prescription-${appointment.user.name}.pdf`)
      .catch(err => {
        console.error("Error generating PDF:", err);
        toast.error('Failed to generate PDF.');
      });
  };

  return (
    <section className="w-full h-auto flex flex-col items-center justify-center bg-gray-50 p-8">
      {/* Prescription Content */}
      <div id="prescription-content" className="relative bg-white w-full max-w-4xl p-10 shadow-lg">

        {/* Watermark */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
          transform: 'rotate(-45deg)',
          zIndex: '0',
        }}>
          <p style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: 'rgba(150, 150, 150, 0.2)',
            whiteSpace: 'nowrap',
          }}>
            Medicare
          </p>
        </div>

        {/* Header */}
        <div className="header mb-8 flex justify-between items-center">
          <div className="doctor-details">
            <h2 className="text-4-bold font-bold">{user.name}</h2>
            <p className="text-3">M.B.B.S. | Reg: No.: 270988 |</p>
            <p className="text-2">Mob. No.: {user.phone}</p>
          </div>

          <div className="logo-container flex justify-center items-center">
            <img src={logoUrl} alt="Hospital Logo" className="w-24 h-5 object-cover" />
          </div>

          <div className="clinic-details text-left">
            <span className="text-primaryColor font-bold text-xl">Medicare &nbsp;</span>
            <p className="text-3">Near Axis Bank, Kothrud, Pune-411038</p>
            <p className="text-2">Mob. No.: {user.phone}</p>
            <p className="text-3">Timing: 09:00 AM - 02:00 PM | Closed: Thursday |</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        <div className="mb-8 flex flex-col lg:flex-row justify-between">
          <div className="w-full lg:w-1/2 mb-4 lg:mb-0">
            <h3 className="text-xl font-semibold">Patient Name: {appointment.user.name}</h3>
            <p className="text-md">Email: {appointment.user.email}</p>
            <p className="text-md">Blood Group: {appointment.user.bloodType}</p>
          </div>

          <div className="w-full lg:w-1/2 text-left lg:text-right">
            <h3 className="text-xl font-semibold">Appointment Date:</h3>
            <p className="text-md">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <h3 className="text-xl font-semibold">Appointment Timing:</h3>
            <p className="text-md">{appointment.startTime} - {appointment.endTime}</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        <div className="mb-8 text-left">
          <h1 className="text-6xl font-bold text-blue-800">℞</h1>
        </div>

        <div className="prescription-body">
          {medicines.map((medicine, index) => (
            <div key={index} className="medicine-item mb-6">
              <label className="block font-semibold text-xl">Medicine Name:</label>
              <input
                type="text"
                name="name"
                value={medicine.name}
                onChange={(event) => handleInputChange(index, event)}
                className="border-b-2 border-gray-500 w-full mb-4 p-2 text-xl"
                placeholder="Enter medicine name"
              />
              <label className="block font-semibold text-xl">Dosage:</label>
              <input
                type="text"
                name="dosage"
                value={medicine.dosage}
                onChange={(event) => handleInputChange(index, event)}
                className="border-b-2 border-gray-500 w-full mb-4 p-2 text-xl"
                placeholder="Enter dosage"
              />
              <label className="block font-semibold text-xl">Frequency:</label>
              <input
                type="text"
                name="frequency"
                value={medicine.frequency}
                onChange={(event) => handleInputChange(index, event)}
                className="border-b-2 border-gray-500 w-full mb-4 p-2 text-xl"
                placeholder="Enter frequency"
              />
              <label className="block font-semibold text-xl">Duration:</label>
              <input
                type="text"
                name="duration"
                value={medicine.duration}
                onChange={(event) => handleInputChange(index, event)}
                className="border-b-2 border-gray-500 w-full mb-4 p-2 text-xl"
                placeholder="Enter duration"
              />
              <label className="block font-semibold text-xl">Instructions:</label>
              <input
                type="text"
                name="instructions"
                value={medicine.instructions}
                onChange={(event) => handleInputChange(index, event)}
                className="border-b-2 border-gray-500 w-full mb-4 p-2 text-xl"
                placeholder="Enter additional instructions"
              />
            </div>
          ))}

          <button
            onClick={addMedicine}
            className="mt-6 px-4 py-2 mb-6 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            + Add Another Medicine
          </button>
        </div>

        <div className="flex mb-8 space-x-4">
          <div className="w-1/2">
            <label className="block font-semibold text-lg">Allergies:</label>
            <input
              type="text"
              value={allergies}
              onChange={handleAllergyChange}
              className="border-b-2 border-gray-500 w-full mb-2 p-2 text-lg" // Adjust text size
              placeholder="Enter allergies, separated by commas"
            />
          </div>

          <div className="w-1/2">
            <label className="block font-semibold text-lg">Additional Notes:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-b-2 border-gray-500 w-full mb-2 p-2 text-lg max-h-40" // Adjust text size and limit height
              placeholder="Enter notes"
            />
          </div>
        </div>


        <div className="footer mt-8">
          <hr className="my-8" />
          <div className="flex justify-between items-center">
            {/* Follow-Up Date */}
            <div>
              <label className="font-semibold text-xl">Follow-Up Date:</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="border-b-2 border-gray-500 p-2 text-xl"
              />
            </div>

            {/* Doctor's Signature */}
            <div className="text-right">
              <img src={doctorSignature} alt="Doctor's Signature" className="w-32 mt-2" />
              <p className="font-semibold text-xl">Doctor's Signature</p>
            </div>
          </div>
        </div>

      </div>

      <div className="w-full flex justify-center mt-8">
        <button
          onClick={handlePrescriptionData}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md shadow hover:bg-blue-500 transition-all duration-200"
        >
          Done - Generate PDF
        </button>
      </div>
    </section>
  );
};

export default Prescription;
