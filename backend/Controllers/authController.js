import User from '../models/UserSchema.js'
import Doctor from '../models/DoctorSchema.js'
import Admin from '../models/AdminSchema.js'
import {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
} from './../Utils/mail.js'

import jwt from 'jsonwebtoken'


const generateAccessAndRefreshTokens = async (userId, role) => {
    try {
        console.log("this is role", userId, role);

        let user = null;
        if (role === 'admin') {
            user = await Admin.findById(userId);
        } else if (role === 'patient') {
            user = await User.findById(userId);

        } else if (role === 'doctor') {
            user = await Doctor.findById(userId);
        }
        const accessToken = user.generateAccessToken();
        //console.log("this is accessToken", accessToken);

        const refreshToken = user.generateRefreshToken();
        //console.log("this is referesh token", refreshToken);

        // attach refresh token to the user document to avoid refreshing the access token with multiple refresh tokens
        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating the access token"
        );
    }
};

export const register = async (req, res) => {
    const { email, password, name, role, photo, gender } = req.body
    //console.log(email);

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



        if (role === 'patient') {

            user = new User({
                name,
                email,
                password,
                photo,
                gender,
                role
            })

        } else if (role === 'doctor') {
            user = new Doctor({
                name,
                email,
                password,
                photo,
                gender,
                role
            })
        } else if (role === 'admin') {
            user = new Admin({
                name,
                email,
                password,
                photo,
                gender,
                role
            })
        }

        //console.log("this is beofere token hashed", user);


        const { unHashedToken, hashedToken, tokenExpiry } =
            user.generateTemporaryToken();


        await user.save()


        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpiry = tokenExpiry;

        await user.save({ validateBeforeSave: false });

        await sendEmail({
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.name,
                `${req.protocol}://${req.get(
                    "host"
                )}/api/v1/users/verify-email/${unHashedToken}`
            ),
        });

        let createdUser;

        if (role === 'admin') {
            createdUser = await Admin.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        } else if (role === 'doctor') {
            createdUser = await Doctor.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        } else if (role === 'patient') {
            createdUser = await User.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        }


        //console.log("this is created user", createdUser);


        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }


        res.status(200).json({ success: true, message: "User created successfully!!" })

    } catch (err) {
        res.status(500).json({ success: false, message: "Internal server error, Try again" })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null

        if (!email && !password) {
            return res.status(400, "Email or password is required");
        }

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

        // Compare the incoming password with hashed password
        console.log("this is before is pass");

        const isPasswordValid = await user.isPasswordCorrect(password);
        console.log("this is is pass", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(404).json({ status: false, message: "Invalid Credentials" });
        }


        //console.log(user.role);

        // Get token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
            user._id,
            user.role
        );


        // get the user document ignoring the password and refreshToken field
        let loggedInUser;
        if (user.role === 'patient') {
            loggedInUser = await User.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        } else if (user.role === 'doctor') {
            loggedInUser = await Doctor.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        } else if (user.role === 'admin') {
            loggedInUser = await Admin.findById(user._id).select(
                "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
            );
        }


        //const { password: userPassword, ...rest } = user._doc;
        // TODO: Add more options to make cookie more secure and reliable
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        res.status(200)
            .cookie("accessToken", accessToken, options) // set the access token in the cookie
            .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
            .json({
                status: true,
                loggedInUser,
                accessToken,
                refreshToken, // send access and refresh token in response if client decides to save them by themselves
                message: "User logged in successfully"
            });
    } catch (err) {
        res.status(500).json({ status: false, message: "Failed to login" })
    }
}

export const logoutUser = async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: '',
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
};

export const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing");
    }

    // generate a hash from the token that we are receiving
    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    // While registering the user, same time when we are sending the verification mail
    // we have saved a hashed value of the original email verification token in the db
    // We will try to find user with the hashed token generated by received token
    // If we find the user another check is if token expiry of that token is greater than current time if not that means it is expired
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    // If we found the user that means the token is valid
    // Now we can remove the associated email token and expiry date as we no  longer need them
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    // Turn the email verified flag to `true`
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
};

// This controller is called when user is logged in and he has snackbar that your email is not verified
// In case he did not get the email or the email verification token is expired
// he will be able to resend the token while he is logged in
export const resendEmailVerification = async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User does not exists", []);
    }

    // if email is already verified throw an error
    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified!");
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken(); // generate email verification creds

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get(
                "host"
            )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
};

export const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // check if incoming refresh token is same as the refresh token attached in the user document
        // This shows that the refresh token is used or not
        // Once it is used, we are replacing it with new refresh token below
        if (incomingRefreshToken !== user?.refreshToken) {
            // If token is valid but is used already
            throw new ApiError(401, "Refresh token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
};

export const forgotPasswordRequest = async (req, res) => {
    const { email } = req.body;

    // Get email from the client and check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404).json({ message: "User does not exists" });
    }

    // Generate a temporary token
    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken(); // generate password reset creds

    // save the hashed version a of the token and expiry in the DB
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    // Send mail with the password reset link. It should be the link of the frontend url with token
    await sendEmail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
            // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
        ),
    });
    return res
        .status(200)
        .json({ message: "Password reset mail has been sent on your mail id" });
};

export const resetForgottenPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Create a hash of the incoming reset token

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // See if user with hash similar to resetToken exists
    // If yes then check if token expiry is greater than current date

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    // If either of the one is false that means the token is invalid or expired
    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    // if everything is ok and token id valid
    // reset the forgot password token and expiry
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    // Set the provided password as the new password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"));
};

export const changeCurrentPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    // check the old password
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    // assign new password in plain text
    // We have a pre save method attached to user schema which automatically hashes the password whenever added/modified
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
};



