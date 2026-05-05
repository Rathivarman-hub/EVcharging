import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"EV Charging Booking" <${process.env.SMTP_USER}>`;

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Your verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4F46E5; text-align: center;">Verification Code</h2>
          <p>Your one-time verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <h1 style="letter-spacing: 8px; color: #4F46E5; font-size: 32px; background: #f3f4f6; padding: 15px; border-radius: 4px; display: inline-block;">${otp}</h1>
          </div>
          <p>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Detailed Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Booking Confirmation - EV Charging',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">Booking Confirmed!</h2>
          <p>Hi there, your EV charging slot has been successfully booked.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toDateString()}</p>
            <p><strong>Time Slot:</strong> ${bookingDetails.timeSlot}</p>
          </div>
          <p>Thank you for choosing our service. Please arrive 5 minutes before your slot.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">EV Charging Booking System</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

export const sendCancellationEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Booking Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #ef4444; text-align: center;">Booking Cancelled</h2>
          <p>Your EV charging slot booking has been successfully cancelled.</p>
          <p>If this was a mistake, you can book a new slot on our website.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">EV Charging Booking System</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};