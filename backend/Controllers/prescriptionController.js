import Prescription from '../models/PrescriptionSchema.js';
import generatePrescriptionHTML from '../Utils/prescriptionTemplate.js';

import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

import {
    sendPrescriptionEmail
}
    from '../Utils/mail.js'
import puppeteer from 'puppeteer'




export const createPrescription = async (req, res) => {
    try {
        const { patientId, appointmentDate, startTime, endTime, doctorId, prescriptionDetails, medication, allergies, notes, followUpDate, qrCode } = req.body;

        if (!patientId || !doctorId) {
            return res.status(400).json({ success: false, message: "Patient ID, Doctor ID, and Prescription Details are required" });
        }

        const patient = await User.findById(patientId);
        const doctor = await Doctor.findById(doctorId);
        console.log(patient.name);

        if (!patient || !doctor) {
            return res.status(404).json({ success: false, message: "Patient or Doctor not found" });
        }

        const prescription = new Prescription({
            patientId,
            doctorId,
            prescriptionDetails,
            medication,
            allergies,
            appointmentDate,
            endTime,
            startTime,
            notes,
            followUpDate,
            qrCode: qrCode // Replace with actual QR code generation logic
        });

        await prescription.save();

        // Generate the HTML for the PDF
        const html = generatePrescriptionHTML({
            doctor,
            patient,
            appointment: {
                appointmentDate: appointmentDate,
                startTime: startTime,
                endTime: endTime,
            },
            medicines: medication,
            allergies,
            notes,
            followUpDate,
            doctorSignature: 'path-to-doctor-signature', // Ensure this is a valid path or base64 string
        });

        // Validate the generated HTML
        const isValidHTML = validatePrescriptionHTML(html, doctor, patient, medication);
        console.log('Is the HTML valid?', isValidHTML);

        // Launch Puppeteer and generate the PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Check if pdfBuffer is an instance of Uint8Array and convert it to Buffer
        const buffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);

        // Check if buffer is valid
        if (!buffer || buffer.length === 0) {
            console.error("PDF buffer is invalid or not defined");
            return res.status(500).json({ success: false, message: "Error generating PDF" });
        }

        // Send email with the PDF attachment
        try {
            await sendPrescriptionEmail(patient.email, patient.name, buffer); // Pass emailContent object directly
            console.log('Email sent successfully with the PDF attachment.');
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        // Send PDF buffer as response to the client
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="prescription-${patient.name}.pdf"`,
        });

        return res.send(buffer);
    } catch (error) {
        console.error("Error creating prescription:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const validatePrescriptionHTML = (html, doctor, patient, medicines) => {
    if (!doctor || !patient || !medicines) {
        return false; // Early return if any object is undefined
    }
    const hasDoctorDetails = html.includes(doctor.name);
    const hasPatientDetails = html.includes(patient.name);
    const hasMedicineDetails = medicines.every(medicine => html.includes(medicine.name));

    return hasDoctorDetails && hasPatientDetails && hasMedicineDetails;
};



// Function to get all prescriptions for a specific patient
export const getPrescriptionsByPatientId = async (req, res) => {
    const { patientId } = req.params;

    try {
        const prescriptions = await Prescription.find({ patientId })
            .populate('doctorId', 'name email phone') // Populate doctor details
            .populate('patientId', 'name email phone'); // Populate patient details

        if (!prescriptions.length) {
            return res.status(404).json({ success: false, message: "No prescriptions found for this patient" });
        }

        return res.status(200).json({ success: true, prescriptions });
    } catch (error) {
        console.error("Error fetching prescriptions:", error);
        return res.status(500).json({ success: false, message: "Error fetching prescriptions", error: error.message });
    }
};

// Function to get a specific prescription by ID
export const getPrescriptionByUniqueId = async (req, res) => {
    const { id } = req.params;

    try {
        const prescription = await Prescription.findOne({ qrCode: id })
            .populate('doctorId', 'name email phone') // Populate doctor details
            .populate('patientId', 'name email phone'); // Populate patient details

        if (!prescription) {
            return res.status(404).json({ success: false, message: "Prescription not found" });
        }

        return res.status(200).json({ success: true, prescription });
    } catch (error) {
        console.error("Error fetching prescription by ID:", error);
        return res.status(500).json({ success: false, message: "Error fetching prescription", error: error.message });
    }
};