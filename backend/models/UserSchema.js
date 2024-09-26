import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";


const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type:
            String
    },
    photo: {
        type: String
    },
    role: {
        type: String,
        enum: ["patient", "admin"],
        default: "patient",
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    bloodType: {
        type: String
    },
    loginType: {
        type: String,
        enum: ["GOOGLE", "GITHUB", "EMAIL_PASSWORD"],
        default: "EMAIL_PASSWORD",
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken: {
        type: String,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpiry: {
        type: Date,
    },
    appointments: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Appointment"
        }
    ]
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
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

UserSchema.methods.generateRefreshToken = function () {
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
UserSchema.methods.generateTemporaryToken = function () {
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

export default mongoose.model("User", UserSchema);