
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  // For Dev: Use Mailtrap or Ethereal if no real creds
  // For Prod: Use Gmail/SendGrid (User needs to provide SMTP env vars)
  
  // Check if SMTP configuration is available
  if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP configuration missing. Email not sent. Please configure SMTP environment variables.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Clean & Green'} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Fallback for clients that don't render HTML
      html: options.html || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${options.subject}</h2>
          <p>${options.message.replace(/\n/g, '<br>')}</p>
          <br>
          <p style="color: #888; font-size: 12px;">Sent by Clean&Green</p>
        </div>
      `
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Email sending failed:', error.message);
    // Don't throw - email failures shouldn't break the application
  }
};

module.exports = sendEmail;
