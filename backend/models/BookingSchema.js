import mongoose from "mongoose";
import Doctor from './DoctorSchema.js';
import User from './UserSchema.js';
const bookingSchema = new mongoose.Schema(
    {
        doctor: {
            type: mongoose.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ticketPrice: { type: String, required: true },
        appointmentDate: {
            type: Date,
            required: true,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        status: {
            type: String,
            enum: ["pending", "approved", "cancelled"],
            default: "pending",
        },
        appointmentType: {
            type: String,
            enum: ["onsite", "virtual"],
        },
        isPaid: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
    this.populate("user").populate({
        path: 'doctor',
        select: 'name'
    })

    next();
})

bookingSchema.post('save', async function (doc, next) {
    try {
        //console.log("this is test data", doc);

        await Doctor.findByIdAndUpdate(doc.doctor, {
            $push: { appointments: this._id }
        });

        await User.findByIdAndUpdate(doc.user, {
            $push: { appointments: this.id }
        })

        next();
    } catch (error) {
        next(error)
    }
})

export default mongoose.model("Booking", bookingSchema);