import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 45000, // 45 seconds
  greetingTimeout: 45000,
  socketTimeout: 45000,
  logger: true,
  debug: true,
});

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"EV Charging Booking" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Verification OTP',
    text: `Your OTP for verification is: ${otp}. It will expire in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Detailed Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  const mailOptions = {
    from: `"EV Charging Booking" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Booking Confirmation',
    html: `
      <h3>Your Booking is Confirmed!</h3>
      <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
      <p><strong>Date:</strong> ${new Date(bookingDetails.date).toDateString()}</p>
      <p><strong>Time Slot:</strong> ${bookingDetails.timeSlot}</p>
      <p>Thank you for using our service.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

export const sendCancellationEmail = async (email) => {
  const mailOptions = {
    from: `"EV Charging Booking" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Booking Cancelled',
    text: 'Your EV charging slot booking has been successfully cancelled.',
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};
