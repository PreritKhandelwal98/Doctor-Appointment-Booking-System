import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    ticketPrice: { type: Number },
    role: { type: String },
    specialization: { type: String },
    qualifications: [{
        startingDate: { type: Date },
        endingDate: { type: Date },
        degree: { type: String },
        university: { type: String }
    }],
    experiences: [{
        startingDate: { type: Date },
        endingDate: { type: Date },
        position: { type: String },
        hospital: { type: String }
    }],
    bio: { type: String, maxLength: 50 },
    about: { type: String },
    timeSlots: [{ day: { type: String }, startingTime: { type: String }, endingTime: { type: String } }],
    gender: { type: String },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
    averageRating: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    isApproved: { type: String, enum: ["pending", "approved", "cancelled"], default: "pending" },
    appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
});


export default mongoose.model("Doctor", DoctorSchema);
