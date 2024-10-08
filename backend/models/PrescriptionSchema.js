import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the Patient model
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor', // Reference to the Doctor model
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    medication: [{
        name: { type: String, required: true },      // Name of the medication
        dosage: { type: String, required: true },    // Dosage instructions
        frequency: { type: String, required: true },  // How often to take it
        duration: { type: String },                    // Duration of the medication course
        instructions: { type: String }                 // Additional instructions
    }],
    allergies: [{ type: String }],                   // List of patient allergies
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    notes: { type: String },                          // Any additional notes
    followUpDate: { type: Date },                    // Date for follow-up appointment
    qrCode: {
        type: String, // Store the QR code data or image URL
        required: true,
    },
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
