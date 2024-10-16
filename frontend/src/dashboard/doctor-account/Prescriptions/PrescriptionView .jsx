import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BASE_URL } from "../../../utils/config";

const PrescriptionView = () => {
  const { id } = useParams(); // Get the prescriptionId from the URL
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await fetch(`${BASE_URL}/prescription/get-prescription/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPrescription(data); // Set the prescription data in the state
        } else {
          throw new Error('Prescription not found.');
        }
      } catch (error) {
        console.error('Error fetching prescription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!prescription) return <div>Prescription not found</div>;

  return (
    <section className="w-full h-auto flex flex-col items-center justify-center bg-gray-50 p-4 md:p-8">
      <div id="prescription-content" className="relative bg-white w-full max-w-4xl p-4 md:p-10 shadow-lg">
        <div className="header mb-4 md:mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="doctor-details">
            <h2 className="text-xl md:text-4xl font-bold">{prescription.doctor.name}</h2>
            <p className="text-sm md:text-lg">M.B.B.S. | Reg: No.: {prescription.doctor.registrationNumber}</p>
            <p className="text-sm md:text-lg">Mob. No.: {prescription.doctor.phone}</p>
          </div>

          <div className="clinic-details text-left md:text-right">
            <span className="text-primaryColor font-bold text-xl">Medicare</span>
            <p className="text-sm md:text-lg">Near Axis Bank, Kothrud, Pune-411038</p>
            <p className="text-sm md:text-lg">Mob. No.: {prescription.doctor.phone}</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Patient Name: {prescription.patient.name}</h3>
            <p className="text-sm md:text-md">Email: {prescription.patient.email}</p>
            <p className="text-sm md:text-md">Blood Group: {prescription.patient.bloodGroup}</p>
          </div>
        </div>

        <hr className="my-4 border-black border-2" />

        <div className="mb-8 text-left">
          <h1 className="text-6xl font-bold text-blue-800">℞</h1>
        </div>

        <div className="prescription-body overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-2 md:px-4 md:py-2">Medicine Name</th>
                <th className="border px-2 py-2 md:px-4 md:py-2">Dosage</th>
                <th className="border px-2 py-2 md:px-4 md:py-2">Frequency</th>
                <th className="border px-2 py-2 md:px-4 md:py-2">Duration</th>
                <th className="border px-2 py-2 md:px-4 md:py-2">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medication.map((medicine, index) => (
                <tr key={index}>
                  <td className="border px-2 py-2">{medicine.name}</td>
                  <td className="border px-2 py-2">{medicine.dosage}</td>
                  <td className="border px-2 py-2">{medicine.frequency}</td>
                  <td className="border px-2 py-2">{medicine.duration}</td>
                  <td className="border px-2 py-2">{medicine.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="my-8" />
        <div className="footer mt-8">
          <h3 className="font-semibold text-lg">Allergies:</h3>
          <p>{prescription.allergies.join(', ')}</p>

          <h3 className="font-semibold text-lg mt-4">Notes:</h3>
          <p>{prescription.prescriptionDetails}</p>

          <div className="text-right mt-8">
            <img src={prescription.doctor.signature} alt="Doctor's Signature" className="w-32" />
            <p className="font-semibold">Doctor's Signature</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrescriptionView;
