# Doctor Appointment Booking Web App

## Overview
This project is a web application designed for booking doctor appointments for both on-site and virtual consultations. The application allows users to browse available doctors, book appointments, make payments through Razorpay, and receive appointment notifications via email using Mailtrap. The backend is built using Node.js with Express, and the frontend is developed using Vue.js. MongoDB is used for data storage.

## Features
- **User Authentication**: Patients can register, login, and manage their appointments.
- **Doctor Approval System**: Doctors must be approved by an admin before they become available for booking.
- **Doctor Search and Selection**: Browse and search for approved doctors based on specialty, location, and availability.
- **Appointment Booking**: Book both on-site and virtual consultations with approved doctors.
- **Payment Integration**: Payments for consultations are handled through Razorpay.
- **Email Notifications**: Patients receive email notifications upon successful booking via Mailtrap.
- **Admin Dashboard**: Admins can manage doctor approvals, appointments, and view payment details.

## Technologies Used
- **Frontend**: Vue.js
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **Payment Gateway**: Razorpay
- **Email Notifications**: Mailtrap
- **Authentication**: JWT (JSON Web Token) for user authentication
- **Styling**: CSS (tailwind)

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Razorpay Account (for Payment Gateway)
- Mailtrap Account (for Email Notification)

## Installation and Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PreritKhandelwal98/Doctor-Appointment-Booking-System.git
   cd doctor-appointment-booking-system
   ```

2. **Backend Setup:**

   - Navigate to the backend folder:

     ```bash
     cd backend
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Set up environment variables. Create a `.env` file in the `backend` directory.

   - Start the backend server:

     ```bash
     npm start
     ```

3. **Frontend Setup:**

   - Navigate to the frontend folder:

     ```bash
     cd ../frontend
     ```

   - Install dependencies:

     ```bash
     npm install
     ```

   - Set up environment variables. Create a `.env` file in the `frontend` directory.

   - Start the frontend development server:

     ```bash
     npm run dev
     ```


## Usage

### Doctor Approval Process:
1. **Doctor Registration**: Doctors register on the platform but are initially set to a "pending approval" status.
2. **Admin Approval**: Admin reviews doctor profiles and approves or rejects the accounts from the admin dashboard.
3. **Booking Availability**: Once a doctor is approved, their profile becomes visible to patients, and appointments can be booked.

### Booking an Appointment:
1. User logs in or registers.
2. Browse through available **approved** doctors based on specialty or location.
3. Select a doctor and choose between on-site or virtual consultation.
4. Proceed to payment using Razorpay.
5. Upon successful booking, the user receives an email notification with the appointment details.

### Admin Dashboard:
Admins can:
- Approve or reject doctor accounts.
- Manage doctor profiles and appointments.
- View payment history.


## Payment Integration
Razorpay is used to handle all payment transactions. You need to set up your Razorpay API keys in the `.env` file and configure the backend to accept and verify payments.

## Email Notifications
Mailtrap is used to send email notifications. Set up your Mailtrap credentials in the `.env` file to enable this functionality. Emails will be sent upon successful appointment booking.

## Doctor Approval System
Doctors must be approved by an admin before their profiles are made visible to patients. This ensures that only verified doctors are available for consultation. Admins have the ability to approve, reject, or delete doctor profiles via the admin dashboard.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
