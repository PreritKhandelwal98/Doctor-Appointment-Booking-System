import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/**
 *
 * @param {{email: string; subject: string; mailgenContent: Mailgen.Content; }} options
 */
const sendEmail = async (options) => {
    // Initialize mailgen instance with default theme and brand configuration
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Medicare",
            link: "https://mailgen.js",
            logo: "https://example.com/logo.png", // Optional: Add your logo for a more branded email
        },
    });

    // Generate the plaintext version of the e-mail
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    // Generate an HTML email with the provided contents
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    // Create a nodemailer transporter instance to send the mail
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "no-reply@medicare.com", // We can name this anything. The mail will go to your Mailtrap inbox
        to: options.email, // receiver's mail
        subject: options.subject, // mail subject
        text: emailTextual, // mailgen content textual variant
        html: emailHtml, // mailgen content html variant
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        logger.error("Email service failed silently. Ensure MAILTRAP credentials in the .env file.");
        logger.error("Error: ", error);
    }
};

/**
 *
 * @param {string} username
 * @param {string} verificationUrl
 * @returns {Mailgen.Content}
 * @description Designs the email verification mail
 */
const emailVerificationMailgenContent = (name, verificationUrl) => {
    return {
        body: {
            name: name,
            intro: "Welcome to Medicare! We're very excited to have you on board.",
            action: {
                instructions: "To verify your email, please click the button below:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Verify your email",
                    link: verificationUrl,
                },
            },
            outro: "Need help or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

/**
 *
 * @param {string} username
 * @param {string} passwordResetUrl
 * @returns {Mailgen.Content}
 * @description Designs the forgot password mail
 */
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We received a request to reset the password for your account.",
            action: {
                instructions: "To reset your password, click the button below:",
                button: {
                    color: "#DC3545", // Red color for password reset
                    text: "Reset password",
                    link: passwordResetUrl,
                },
            },
            outro: "If you didn’t request a password reset, feel free to ignore this email.",
        },
    };
};

/**
 *
 * @param {string} name
 * @param {string} appointmentDetails
 * @returns {Mailgen.Content}
 * @description Designs the email for "Appointment Booked but Waiting for Approval"
 */
const appointmentBookedMailgenContent = (name, appointmentDetails, doctorName) => {
    return {
        body: {
            name: name,
            intro: `Your appointment is booked and is currently pending approval.`,
            table: {
                data: [
                    {
                        item: "Appointment Date",
                        description: appointmentDetails.appointmentDate,
                    },
                    {
                        item: "Appointment Time",
                        description: `${appointmentDetails.startTime} ${appointmentDetails.endTime}`,
                    },
                    {
                        item: "Doctor",
                        description: doctorName,
                    },
                ],
            },
            action: {
                instructions: "You will be notified once the appointment is confirmed.",
                button: {
                    color: "#FFA500", // Orange for waiting status
                    text: "View Appointment",
                    link: appointmentDetails.appointmentLink,
                },
            },
            outro: "Thank you for choosing Medicare. We are looking forward to serving you.",
        },
    };
};


/**
 *
 * @param {string} doctorName
 * @param {Object} bookingDetails
 * @param {string} patientName
 * @returns {Mailgen.Content}
 * @description Designs the email for notifying the doctor of a new booking
 */
const doctorBookingNotificationMailgenContent = (doctorName, bookingDetails, patientName) => {
    return {
        body: {
            name: doctorName,
            intro: `You have a new appointment booking with ${patientName}. Please review the details below.`,
            table: {
                data: [
                    {
                        item: "Patient Name",
                        description: patientName,
                    },
                    {
                        item: "Appointment Date",
                        description: bookingDetails.appointmentDate,
                    },
                    {
                        item: "Appointment Time",
                        description: `${bookingDetails.startTime} - ${bookingDetails.endTime}`,
                    },
                    {
                        item: "Appointment Type",
                        description: bookingDetails.appointmentType,
                    },
                    {
                        item: "Notes",
                        description: bookingDetails.notes || "No additional notes provided.",
                    },
                ],
            },
            action: {
                instructions: "You can view further details and manage your appointments by clicking the button below:",
                button: {
                    color: "#22BC66", // Green color for a positive action
                    text: "View Appointment",
                    link: bookingDetails.doctorLink, // Link to the doctor's appointment management portal
                },
            },
            outro: "Thank you for being a part of Medicare! We appreciate your commitment to patient care.",
        },
    };
};

/**
 *
 * @param {string} name
 * @param {string} status
 * @param {string} appointmentDetails
 * @returns {Mailgen.Content}
 * @description Designs the email for "Appointment Status Changed"
 */
const appointmentStatusChangedMailgenContent = (name, doctorName, status, appointmentDetails,) => {
    const statusColor = status === "approved" ? "#22BC66" : "#FF0000"; // Green for approved, red for cancelled
    const statusMessage = status === "approved"
        ? "Your appointment has been approved."
        : "Your appointment has been cancelled.";

    return {
        body: {
            name: name,
            intro: statusMessage,
            table: {
                data: [
                    {
                        item: "Appointment Date",
                        description: appointmentDetails.appointmentDate,
                    },
                    {
                        item: "Appointment Time",
                        description: `${appointmentDetails.startTime} - ${appointmentDetails.endTime}`,
                    },
                    {
                        item: "Doctor",
                        description: doctorName,
                    },
                    {
                        item: "Status",
                        description: status === "approved" ? "Approved" : "Cancelled",
                    },
                ],
            },
            action: {
                instructions: "You can view further details of your appointment by clicking the button below:",
                button: {
                    color: statusColor,
                    text: "View Appointment",
                    link: appointmentDetails.appointmentLink,
                },
            },
            outro: status === "approved"
                ? "Looking forward to seeing you at your appointment!"
                : "Sorry for the inconvenience. Please contact us if you have any questions.",
        },
    };
};



export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    appointmentBookedMailgenContent,
    appointmentStatusChangedMailgenContent,
    doctorBookingNotificationMailgenContent
};
