import jwt from 'jsonwebtoken'
import Doctor from '../models/DoctorSchema.js'
import User from '../models/UserSchema.js'
import Admin from '../models/AdminSchema.js';

export const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded);

        req.userId = decoded._id;

        req.role = decoded.role;


        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token is expired" });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        } else {
            // Handle other potential errors
            return res.status(500).json({ success: false, message: "Server error", error: err.message });
        }
    }
};

export const restrict = (roles) => {
    return async (req, res, next) => {
        const userId = req.userId;
        console.log(`this is userId: ${userId} and roles ${roles}`);

        let user;

        try {
            // Fetch the user from the database
            const patient = await User.findById(userId);
            const doctor = await Doctor.findById(userId);
            const admin = await Admin.findById(userId);

            user = patient || doctor || admin;

            // Check if user exists and has one of the required roles
            if (!user || !roles.includes(user.role)) {
                return res.status(401).json({ success: false, message: "You're not authorized" });
            }

            next();
        } catch (err) {
            return res.status(500).json({ success: false, message: "Server error" });
        }
    };
};


