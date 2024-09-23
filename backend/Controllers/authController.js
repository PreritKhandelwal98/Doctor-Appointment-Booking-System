import User from '../models/UserSchema.js'
import Doctor from '../models/DoctorSchema.js'
import Admin from '../models/AdminSchema.js'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const generateToken = user => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    })
}

export const register = async (req, res) => {
    const { email, password, name, role, photo, gender } = req.body

    try {
        let user = null

        if (role === 'patient') {
            user = await User.findOne({ email })
        } else if (role === 'doctor') {
            user = await Doctor.findOne({ email })
        } else if (role === 'admin') {
            user = await Admin.findOne({ email })
        }

        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        if (role === 'patient') {
            user = new User({
                name,
                email,
                password: hashedPassword,
                photo,
                gender,
                role
            })
        } else if (role === 'doctor') {
            user = new Doctor({
                name,
                email,
                password: hashedPassword,
                photo,
                gender,
                role
            })
        } else if (role === 'admin') {
            user = new Admin({
                name,
                email,
                password: hashedPassword,
                photo,
                gender,
                role
            })
        }

        await user.save()

        res.status(200).json({ success: true, message: "User created successfully!!" })

    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error, Try again" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null

        const patient = await User.findOne({ email })
        const doctor = await Doctor.findOne({ email })
        const admin = await Admin.findOne({ email })

        if (patient) {
            user = patient
        } else if (doctor) {
            user = doctor
        } else if (admin) {
            user = admin
        }

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(404).json({ status: false, message: "Invalid Credentials" });
        }

        // Get token
        console.log(`this is user detail ${user}`);

        const token = generateToken(user);

        const { password: userPassword, ...rest } = user._doc;

        res.status(200).json({
            status: true,
            message: "Login Successful",
            token,
            data: rest
        })
    } catch (err) {
        res.status(500).json({ status: false, message: "Failed to login" })
    }
}


