import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const DoctorSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    signature: { type: String },
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

DoctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

DoctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

DoctorSchema.methods.generateAccessToken = function () {
    console.log("this is called");

    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

DoctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

/**
 * @description Method responsible for generating tokens for email verification, password reset etc.
 */
DoctorSchema.methods.generateTemporaryToken = function () {
    // This token should be client facing
    // for example: for email verification unHashedToken should go into the user's mail
    const unHashedToken = crypto.randomBytes(20).toString("hex");


    // This should stay in the DB to compare at the time of verification
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    // This is the expiry time for the token (20 minutes)


    const tokenExpiry = Date.now() + (20 * 60 * 1000);

    return { unHashedToken, hashedToken, tokenExpiry };
};

export default mongoose.model("Doctor", DoctorSchema);
