import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'EV Charging Booking <onboarding@resend.dev>';

export const sendOTPEmail = async (email, otp) => {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your verification code',
    html: `
      <p>Your one-time verification code is:</p>
      <h2 style="letter-spacing:6px; color: #4F46E5;">${otp}</h2>
      <p>This code expires in <strong>10 minutes</strong>. Do not share it.</p>
    `,
  });

  if (error) {
    console.error('Detailed Error sending OTP email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Booking Confirmation',
    html: `
      <h3>Your Booking is Confirmed!</h3>
      <p><strong>Station:</strong> ${bookingDetails.stationName}</p>
      <p><strong>Date:</strong> ${new Date(bookingDetails.date).toDateString()}</p>
      <p><strong>Time Slot:</strong> ${bookingDetails.timeSlot}</p>
      <p>Thank you for using our service.</p>
    `,
  });

  if (error) {
    console.error('Error sending confirmation email:', error);
  }
};

export const sendCancellationEmail = async (email) => {
  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Booking Cancelled',
    text: 'Your EV charging slot booking has been successfully cancelled.',
  });

  if (error) {
    console.error('Error sending cancellation email:', error);
  }
};