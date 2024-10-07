import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import logoUrl from './../../../assets/images/logo.png';

const Prescription = ({ doctorName, hospitalName, doctorSignature, patientName, patientEmail, user, appointment }) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '' }]);
  const [showAddMedicineButton, setShowAddMedicineButton] = useState(true); // State to manage button visibility

  // Function to add more medicines
  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '' }]);
  };

  // Handle input change for medicines
  const handleInputChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };
  
  // Function to generate the PDF
  const generatePdf = async () => {
    setShowAddMedicineButton(false); // Hide the button before generating the PDF
    
    const pdfContent = document.getElementById('prescription-content');

    const pdfOptions = {
      margin: 1,
      filename: `Prescription_for_${appointment.user.name}.pdf`,
      html2canvas: {},
      jsPDF: { format: 'a4' },
    };

    // Generate PDF from the content
    html2pdf()
      .from(pdfContent)
      .set(pdfOptions)
      .save()
      .then(() => {
        setShowAddMedicineButton(true); // Show the button after generating the PDF
        savePrescriptionToDatabase(); // Save prescription details after generating PDF
      })
      .catch(() => {
        setShowAddMedicineButton(true); // Ensure the button is shown in case of error
      });
  };

  // Function to save the prescription details in the database
  const savePrescriptionToDatabase = async () => {
    const prescriptionDetails = {
      doctorName,
      hospitalName,
      patientName,
      patientEmail,
      medicines,
      date: new Date(),
    };

    const response = await fetch('/api/save-prescription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionDetails),
    });

    if (response.ok) {
      alert('Prescription saved and sent successfully!');
    } else {
      alert('Error saving prescription.');
    }
  };

  return (
    <section className="w-full h-auto flex flex-col items-center justify-center bg-gray-50 p-8">
      {/* Prescription Content */}
      <div id="prescription-content" className="relative bg-white w-full max-w-4xl p-10 shadow-lg">
        
        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none', // Ensure the watermark is not interactable
            transform: 'rotate(-45deg)', // Rotate the watermark
            zIndex: '0',
          }}
        >
          <p
            style={{
              fontSize: '6rem',
              fontWeight: 'bold',
              color: 'rgba(150, 150, 150, 0.2)', // Light gray and transparent
              whiteSpace: 'nowrap', // Prevent text wrapping
            }}
          >
            Medicare
          </p>
        </div>

        {/* Header */}
        <div className="header mb-8 flex justify-between items-center">
          <div className="doctor-details">
            <h2 className="text-4-bold font-bold">{user.name}</h2>
            <p className="text-3">MBBS | Reg: No.: 270988 |</p>
            <p className="text-2">Mob. No.: {user.phone}</p>
          </div>
          
          <div className="logo-container flex justify-center items-center">
            <img src={logoUrl} alt="Hospital Logo" className="w-24 h-5 object-cover" />
          </div>

          <div className="clinic-details text-left">
            <span className="text-primaryColor font-bold text-xl">Medicare &nbsp;</span>
            <p className="text-3">Near Axis Bank, Kothrud,Pune-411038</p>
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
                className="border-b-2 border-gray-500 w-full p-2 text-xl"
                placeholder="Enter dosage"
              />
            </div>
          ))}

          {showAddMedicineButton && (
            <button
              onClick={addMedicine}
              className="mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              + Add Another Medicine
            </button>
          )}
        </div>

        <div className="footer mt-8 text-right">
          <hr className="my-8" />
          <img src={doctorSignature} alt="Doctor's Signature" className="w-32 mt-2 ml-auto" />
          <p className="font-semibold text-xl">Doctor's Signature</p>
        </div>
      </div>

      <div className="w-full flex justify-center mt-8">
        <button
          onClick={generatePdf}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-md shadow hover:bg-blue-500 transition-all duration-200"
        >
          Done - Generate PDF
        </button>
      </div>
    </section>
  );
};

export default Prescription;
