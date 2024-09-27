import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: Number },
    photo: { type: String },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodType: { type: String },
}, {
    timestamps: true
});

AdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

AdminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

AdminSchema.methods.generateAccessToken = function () {
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

AdminSchema.methods.generateRefreshToken = function () {
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
AdminSchema.methods.generateTemporaryToken = function () {
    // This token should be client facing
    // for example: for email verification unHashedToken should go into the user's mail
    console.log("before temp token");

    const unHashedToken = crypto.randomBytes(20).toString("hex");
    console.log("after temp token");


    // This should stay in the DB to compare at the time of verification
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");
    // This is the expiry time for the token (20 minutes)


    const tokenExpiry = Date.now() + (20 * 60 * 1000);

    return { unHashedToken, hashedToken, tokenExpiry };
};

export default mongoose.model("Admin", AdminSchema);