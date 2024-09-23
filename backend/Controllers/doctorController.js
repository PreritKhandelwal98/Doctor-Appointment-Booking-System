import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import Appointment from '../models/BookingSchema.js';

export const updateDoctor = async (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(id, { $set: req.body }, { new: true });

        res.status(200).json({ success: true, message: "Doctor updated Successfully", data: updatedDoctor });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update" });
    }
}

export const deleteDoctor = async (req, res) => {
    const id = req.params.id;

    try {
        await Doctor.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Doctor deleted Successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete" });
    }
}

export const getSingleDoctor = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await Doctor.findById(id).populate("reviews").select('-password');

        res.status(200).json({ success: true, message: "Doctor found", data: user });
    } catch (err) {
        res.status(404).json({ success: false, message: "No Doctor found" });
    }
}

//for home page where only show approved doctors
export const getAllDoctor = async (req, res) => {
    try {
        const { query } = req.query;
        let doctors;

        if (query) {
            doctors = await Doctor.find({
                isApproved: 'approved', $or: [
                    { name: { $regex: query, $options: "i" } },
                    { specialization: { $regex: query, $options: "i" } }
                ],
            }).select("-password");
        } else {
            doctors = await Doctor.find({ isApproved: "approved" }).select('-password');
        }

        res.status(200).json({ success: true, message: "Doctors are:", data: doctors });
    } catch (err) {
        res.status(404).json({ success: false, message: "Not found" });
    }
}

//give all doctors
export const getAllDoctors = async (req, res) => {
    try {
        const { query } = req.query;
        let doctors;

        if (query) {
            // If there's a search query, filter by 'name' or 'specialization'
            doctors = await Doctor.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { specialization: { $regex: query, $options: "i" } }
                ],
            }).select("-password");
        } else {
            // If no search query, return all doctors without filtering by approval status
            doctors = await Doctor.find({}).select("-password");
        }

        // Respond with the list of doctors
        res.status(200).json({ success: true, message: "Doctors list:", data: doctors });
    } catch (err) {
        // Handle any errors that occur
        res.status(404).json({ success: false, message: "Not found" });
    }
};


export const getDoctorProfile = async (req, res) => {
    const doctorId = req.userId;

    try {
        const doctor = await Doctor.findById(doctorId).select("-password");
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        const appointments = await Booking.find({ doctor: doctorId }).populate('user', '-password');
        console.log(appointments);

        return res.status(200).json({
            success: true,
            message: "Doctor details found",
            data: { doctor, appointments }
        });
    } catch (err) {
        console.error("Error fetching doctor profile:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}



//for admin use
export const changeDoctorStatus = async (req, res) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    try {
        const doctor = await Doctor.findByIdAndUpdate(id, { isApproved }, { new: true });
        console.log("doctor status changes", doctor);

        if (!doctor) {
            return res.status(400).json({ success: false, message: "Doctor not found" });
        }
        res.status(200).json({ success: true, message: "Status updated successfully", data: isApproved });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}



export const getAllDoctorTimeSlots = async (req, res) => {
    const { doctorId } = req.params;
    console.log(doctorId);

    try {
        // Fetch the doctor's time slots
        const doctor = await Doctor.findById(doctorId).select("timeSlots");

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Return the doctor's time slots
        return res.status(200).json({ timeSlots: doctor.timeSlots });
    } catch (error) {
        console.error("Error fetching doctor's time slots:", error);
        return res.status(500).json({ message: "Server error. Please try again later." });
    }
};
