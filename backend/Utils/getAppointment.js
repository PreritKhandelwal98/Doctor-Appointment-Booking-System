// Import the BookingSchema model
import BookingSchema from "../models/BookingSchema.js";

// In-memory cache for storing appointments
const appointments = new Map();

// Utility function to fetch appointment by roomId (which is actually the _id in the database)
export async function getAppointment(roomId) {
    // Check if the appointment exists in the cache
    if (appointments.has(roomId)) {
        console.log(`Appointment for roomId ${roomId} found in cache`);
        return appointments.get(roomId); // Return cached appointment
    }

    try {
        // Fetch appointment from the database using _id instead of roomId
        const appointment = await BookingSchema.findOne({ _id: roomId });

        if (appointment) {
            // Store the appointment in the cache for future lookups, treating _id as roomId
            const appointmentData = {
                doctor: appointment.doctor,
                patient: appointment.patient,
                roomId: appointment._id.toString() // Return _id as roomId
            };

            appointments.set(roomId, appointmentData);

            console.log(`Appointment for roomId ${roomId} fetched from database and cached`);
            return appointmentData;
        } else {
            console.log(`No appointment found for roomId ${roomId}`);
            return null; // Return null if no appointment found
        }
    } catch (error) {
        console.error(`Error fetching appointment for roomId ${roomId}:`, error);
        throw new Error('Failed to fetch appointment');
    }
}
