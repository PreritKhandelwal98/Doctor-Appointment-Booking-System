import { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import logoUrl from './../../../assets/images/logo.png';
import { BASE_URL } from "../../../utils/config";
import { toast } from 'react-toastify';
import QRCode from 'react-qr-code';

const Prescription = ({ user, appointment }) => {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [allergies, setAllergies] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');

  const doctorSignature = user.signature;

  useEffect(() => {
    const uniqueId = `prescription-${Date.now()}`;
    setPrescriptionId(uniqueId);
    generateQRCode(uniqueId);
  }, []);

  const generateQRCode = (uniqueId) => {
    const prescriptionDetails = {
      prescriptionId: uniqueId,
      doctorId: user._id,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientId: appointment.user._id,
      prescriptionDetails: notes,
      medication: medicines,
      allergies: allergies.split(',').map(allergy => allergy.trim()),
      followUpDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setQrCodeData(JSON.stringify(prescriptionDetails));
  };

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const handleInputChange = (index, event) => {
    const values = [...medicines];
    values[index][event.target.name] = event.target.value;
    setMedicines(values);
  };

  const handleAllergyChange = (event) => {
    setAllergies(event.target.value);
  };

  const handlePrescriptionData = async () => {
    const prescriptionDetails = {
      doctorId: user._id,
      appointmentDate: appointment.appointmentDate,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientId: appointment.user._id,
      prescriptionDetails: notes,
      medication: medicines,
      allergies: allergies.split(',').map(allergy => allergy.trim()),
      followUpDate,
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
        generatePDF();
      } else {
        throw new Error('Error saving prescription.');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
    <section className="w-full h-auto flex flex-col items-center justify-center bg-gray-50 p-4 md:p-8">
      {/* Prescription Content */}
      <div id="prescription-content" className="relative bg-white w-full max-w-4xl p-4 md:p-10 shadow-lg">

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
        <div className="header mb-4 md:mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="doctor-details">
            <h2 className="text-xl md:text-4xl font-bold">{user.name}</h2>
            <p className="text-sm md:text-lg">M.B.B.S. | Reg: No.: 270988</p>
            <p className="text-sm md:text-lg">Mob. No.: {user.phone}</p>
          </div>

          <div className="logo-container flex justify-center items-center">
            <img src={logoUrl} alt="Hospital Logo" className="w-12 h-12 md:w-24 md:h-24 object-cover" />
          </div>

          <div className="clinic-details text-left md:text-right">
            <span className="text-primaryColor font-bold text-xl">Medicare</span>
            <p className="text-sm md:text-lg">Near Axis Bank, Kothrud, Pune-411038</p>
            <p className="text-sm md:text-lg">Mob. No.: {user.phone}</p>
            <p className="text-sm md:text-lg">Timing: 09:00 AM - 02:00 PM</p>
            <p className="text-sm md:text-lg">Closed: Thursday</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        {/* QR and Patient Details */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            {qrCodeData && (
              <div>
                <h3 className="text-lg font-semibold">QR Code:</h3>
                <QRCode value={qrCodeData} size={128} className="mt-4" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold">Patient Name: {appointment.user.name}</h3>
            <p className="text-sm md:text-md">Email: {appointment.user.email}</p>
            <p className="text-sm md:text-md">Blood Group: {appointment.user.bloodType}</p>
          </div>

          <div className="text-left md:text-right">
            <h3 className="text-lg font-semibold">Appointment Date:</h3>
            <p className="text-sm md:text-md">{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
            <h3 className="text-lg font-semibold">Appointment Timing:</h3>
            <p className="text-sm md:text-md">{appointment.startTime} - {appointment.endTime}</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        {/* Prescription Content */}
        <div className="mb-8 text-left">
          <h1 className="text-6xl font-bold text-blue-800">℞</h1>
        </div>

        {/* Medicines Table */}
        <div className="prescription-body overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Medicine Name</th>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Dosage</th>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Frequency</th>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Duration</th>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Instructions</th>
                <th className="border px-2 py-2 md:px-4 md:py-2 w-1/5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <input
                      type="text"
                      name="name"
                      value={medicine.name}
                      onChange={e => handleInputChange(index, e)}
                      className="w-full border p-1 rounded-md"
                    />
                  </td>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <input
                      type="text"
                      name="dosage"
                      value={medicine.dosage}
                      onChange={e => handleInputChange(index, e)}
                      className="w-full border p-1 rounded-md"
                    />
                  </td>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <input
                      type="text"
                      name="frequency"
                      value={medicine.frequency}
                      onChange={e => handleInputChange(index, e)}
                      className="w-full border p-1 rounded-md"
                    />
                  </td>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <input
                      type="text"
                      name="duration"
                      value={medicine.duration}
                      onChange={e => handleInputChange(index, e)}
                      className="w-full border p-1 rounded-md"
                    />
                  </td>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <input
                      type="text"
                      name="instructions"
                      value={medicine.instructions}
                      onChange={e => handleInputChange(index, e)}
                      className="w-full border p-1 rounded-md"
                    />
                  </td>
                  <td className="border px-2 py-2 md:px-4 md:py-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md"
                      onClick={addMedicine}
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Allergies and Notes */}
        <div className="mb-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <h3 className="text-lg font-semibold">Allergies:</h3>
            <textarea
              value={allergies}
              onChange={handleAllergyChange}
              className="w-full border p-2 rounded-md"
              rows="3"
              placeholder="Enter any allergies"
            />
          </div>

          <div className="form-group">
            <h3 className="text-lg font-semibold">Additional Notes:</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border p-2 rounded-md"
              rows="3"
              placeholder="Enter any additional instructions"
            />
          </div>
        </div>

        <hr className="my-8" />
 

        {/* Follow Up */}
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

      {/* Button to Save PDF */}
      <div className="mt-8">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
          onClick={handlePrescriptionData}
        >
          Save and Send Prescription
        </button>
      </div>
    </section>
  );
};

export default Prescription;
