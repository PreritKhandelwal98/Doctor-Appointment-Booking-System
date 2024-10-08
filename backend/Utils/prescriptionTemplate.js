const generatePrescriptionHTML = ({ doctor, patient, appointment, medicines, allergies, notes, followUpDate, doctorSignature }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prescription</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .header, .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .header img {
            width: 100px;
          }
          .watermark {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transform: rotate(-45deg);
            font-size: 5rem;
            font-weight: bold;
            color: rgba(150, 150, 150, 0.2);
            z-index: -1;
          }
          hr {
            border: 1px solid black;
          }
          .medicines-list {
            margin-top: 20px;
          }
          .medicines-list div {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="watermark">Medicare</div>
        <div class="header">
          <div class="doctor-details">
            <h2>${doctor.name}</h2>
            <p>M.B.B.S. | Reg: No.: 270988</p>
            <p>Mob. No.: ${doctor.phone}</p>
          </div>
          <img src="${doctorSignature}" alt="Doctor's Signature" />
          <div class="clinic-details">
            <p><strong>Medicare</strong></p>
            <p>Near Axis Bank, Kothrud, Pune-411038</p>
            <p>Mob. No.: ${doctor.phone}</p>
            <p>Timing: 09:00 AM - 02:00 PM | Closed: Thursday</p>
          </div>
        </div>
        <hr />
        <div class="patient-details">
          <h3>Patient Name: ${patient.name}</h3>
          <p>Email: ${patient.email}</p>
          <p>Blood Group: ${patient.bloodType}</p>
          <p>Appointment Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p>Appointment Time: ${appointment.startTime} - ${appointment.endTime}</p>
        </div>
        <hr />
        <h1>℞</h1>
        <div class="medicines-list">
          ${medicines.map((medicine) => `
            <div>
              <p><strong>Medicine Name:</strong> ${medicine.name}</p>
              <p><strong>Dosage:</strong> ${medicine.dosage}</p>
              <p><strong>Frequency:</strong> ${medicine.frequency}</p>
              <p><strong>Duration:</strong> ${medicine.duration}</p>
              <p><strong>Instructions:</strong> ${medicine.instructions}</p>
            </div>
          `).join('')}
        </div>
        <hr />
        <div class="allergies">
          <p><strong>Allergies:</strong> ${allergies.join(', ')}</p>
        </div>
        <div class="notes">
          <p><strong>Additional Notes:</strong> ${notes}</p>
        </div>
        <div class="follow-up">
          <p><strong>Follow-Up Date:</strong> ${followUpDate}</p>
        </div>
        <div class="footer">
          <hr />
          <p>Doctor's Signature:</p>
          <img src="#" alt="Doctor's Signature" />
        </div>
      </body>
    </html>
  `;
};

export default generatePrescriptionHTML;
