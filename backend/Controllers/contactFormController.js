import nodemailer from 'nodemailer';

// Configure the SMTP transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'your-email@yourdomain.com',
        pass: 'your-email-password'
    }
});

const sendEmails = async (userEmail, subject, message) => {
    try {
        // Send acknowledgment to the user
        await transporter.sendMail({
            from: 'info@yourdomain.com', // Custom "From" address
            to: userEmail,
            subject: 'Thank You for Your Feedback',
            html: `
            <p>Hi ${userEmail},</p>
            <p>Thank you for reaching out to us. We have received your message with the subject "${subject}" and will work on it shortly. Your feedback is important to us.</p>
            <p>Best regards,<br>Your Company Team</p>
            `
        });

        // Send notification to admin
        await transporter.sendMail({
            from: 'info@yourdomain.com', // Custom "From" address
            to: 'admin@yourdomain.com',
            subject: 'New Contact Form Submission',
            html: `
            <p>Hi Admin,</p>
            <p>You have received a new message from the contact form.</p>
            <p><strong>Sender:</strong> ${userEmail}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <p>Best regards,<br>Your Website</p>
            `
        });

        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
        throw error; // Re-throw error to handle in route
    }
};

export const contactFormHandler = async (req, res) => {
    try {
        const { email, subject, message } = req.body;
        await sendEmails(email, subject, message);
        res.status(200).send('Emails sent');
    } catch (error) {
        res.status(500).send('Failed to send emails');
    }
};
