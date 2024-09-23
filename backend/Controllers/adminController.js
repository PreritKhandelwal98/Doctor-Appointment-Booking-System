import Admin from '../models/AdminSchema.js'

export const updateAdmin = async (req, res) => {
    const id = req.params.id

    try {
        const updateAdmin = await Admin.findByIdAndUpdate(id, { $set: req.body }, { new: true })

        res.status(200).json({ success: true, message: "Admin updated Successfully", data: updateAdmin })
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update" })
    }
}

export const deleteAdmin = async (req, res) => {
    const id = req.params.id

    try {
        await Admin.findByIdAndDelete(id)

        res.status(200).json({ success: true, message: "Admin deleted Successfully" })
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete " })
    }
}

export const getSingleAmdin = async (req, res) => {
    const id = req.params.id

    try {
        const admin = await Admin.findById(id).select('-password')

        res.status(200).json({ success: true, message: "Admin found", data: admin })
    } catch (err) {
        res.status(404).json({ success: false, message: "Admin not found" })
    }
}

export const getAllAdmin = async (req, res) => {
    try {
        const admins = await Admin.find({}).select('-password')

        res.status(200).json({ success: true, message: "Admins found", data: admins })
    } catch (err) {
        res.status(404).json({ success: false, message: "Data not found" })
    }
}

export const getAdminProfile = async (req, res) => {
    const adminId = req.userId;

    try {
        const admin = await Admin.findById(adminId).select('-password');

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        return res.status(200).json({ success: true, message: "Admin detail found", data: admin });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
    }
};



