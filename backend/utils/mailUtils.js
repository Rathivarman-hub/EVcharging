import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
const smtpTransporter = smtpConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const FROM = process.env.RESEND_FROM_EMAIL || 'EV Charging Booking <onboarding@resend.dev>';
const SMTP_FROM = process.env.SMTP_USER;
const RESEND_TEST_MODE_HINT = 'You can only send testing emails to your own email address';

const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const sendOTPEmail = async (email, otp, expiryMinutes = 10) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; text-align: center;">Verification Code</h2>
          <p>Hi there, use the following code to verify your account:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">${otp}</span>
          </div>
          <p>This code expires in <strong>${expiryMinutes} minutes</strong>. Do not share it with anyone.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">EV Charging Booking System</p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error sending OTP email with Resend:', error);
    const errorMessage = error?.message || 'Unknown email provider error';
    if (errorMessage.includes(RESEND_TEST_MODE_HINT)) {
      throw new Error(
        'Email provider is in test mode. Verify your domain in Resend and set RESEND_FROM_EMAIL in backend .env to send OTPs to other email addresses.'
      );
    }
    throw new Error(`Failed to send OTP email: ${errorMessage}`);
  }
};

const sendEmail = async ({ to, subject, html }) => {
  if (smtpTransporter) {
    await smtpTransporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
  });

  if (error) {
    throw error;
  }
};

export const sendBookingConfirmation = async (email, bookingDetails) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Booking Confirmation - EV Charging',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #10b981; text-align: center;">Booking Confirmed!</h2>
          <p>Hi there, your EV charging slot has been successfully booked.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Station:</strong> ${escapeHtml(bookingDetails.stationName)}</p>
            <p><strong>Date:</strong> ${escapeHtml(new Date(bookingDetails.date).toDateString())}</p>
            <p><strong>Time Slot:</strong> ${escapeHtml(bookingDetails.timeSlot)}</p>
          </div>
          <p>Thank you for choosing our service. Please arrive 5 minutes before your slot.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">EV Charging Booking System</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending confirmation email with Resend:', error);
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
};

export const sendCancellationEmail = async (email, bookingDetails) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Booking Cancelled - EV Charging',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #ef4444; text-align: center;">Booking Cancelled</h2>
          <p>Your EV charging slot booking has been successfully cancelled.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Station:</strong> ${escapeHtml(bookingDetails.stationName)}</p>
            <p><strong>Date:</strong> ${escapeHtml(new Date(bookingDetails.date).toDateString())}</p>
            <p><strong>Time Slot:</strong> ${escapeHtml(bookingDetails.timeSlot)}</p>
          </div>
          <p>If this was a mistake, you can book a new slot on our website.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #64748b; text-align: center;">EV Charging Booking System</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending cancellation email with Resend:', error);
    throw new Error(`Failed to send cancellation email: ${error.message}`);
  }
};