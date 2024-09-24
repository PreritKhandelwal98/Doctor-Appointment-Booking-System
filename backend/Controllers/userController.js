import User from '../models/UserSchema.js'
import Booking from '../models/BookingSchema.js'
import Doctor from '../models/DoctorSchema.js'
import mongoose from 'mongoose'

export const updateUser = async (req, res) => {
    const id = req.params.id;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    console.log('Request Body:', req.body); // Log the request body

    try {
        const updateUser = await User.findByIdAndUpdate(id, { $set: req.body }, { new: true });

        // Check if the user was found and updated
        if (!updateUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User updated successfully", data: updateUser });
    } catch (err) {
        console.error('Update Error:', err); // Log the error
        res.status(500).json({ success: false, message: "Failed to update", error: err.message });
    }
}

export const deleteUser = async (req, res) => {
    const id = req.params.id

    try {
        await User.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: "User deleted Successfully" })
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete " })
    }
}

export const getSingleUser = async (req, res) => {
    const id = req.params.id

    try {
        const user = await User.findById(id).select('-password')

        res.status(200).json({ success: true, message: "User found", data: user })
    } catch (err) {
        res.status(404).json({ success: false, message: "User not found" })
    }
}

export const getAllUser = async (req, res) => {
    const id = req.params.id

    try {
        const users = await User.find({}).select('-password')

        res.status(200).json({ success: true, message: "User found", data: users })
    } catch (err) {
        res.status(404).json({ success: false, message: "User not found" })
    }
}

export const getUserProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User detail found", data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
    }
};


// export const getMyAppointment = async (req, res) => {

//     try {
//         const bookings = await Booking.find({ user: req.userId })
//         const doctorIds = bookings.map(el => el.doctor.id);
//         console.log("this is doctor id:", doctorIds);

//         const doctors = await Doctor.find({ _id: { $in: doctorIds } }).select("-password")
//         // console.log(doctors);
//         return res.status(200).json({ success: true, message: "Appointment are getting", data: doctors });
//     } catch (err) {
//         res.status(500).json({ success: false, message: "Something went wrong" })
//     }
// }


export const getMyAppointment = async (req, res) => {
    try {
        // Fetch all bookings associated with the user ID in the request
        const bookings = await Booking.find({ user: req.userId })
            .populate('doctor', '-password') // Populate doctor details but exclude the password field


        // Check if any bookings were found
        if (!bookings.length) {
            return res.status(404).json({ success: false, message: "No appointments found for this user." });
        }

        // Return the fetched bookings with a success message
        return res.status(200).json({
            success: true,
            message: "Appointments fetched successfully",
            data: bookings,
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

