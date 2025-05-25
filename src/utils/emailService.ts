import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_RESET_URL}?token=${token}&email=${encodeURIComponent(email)}`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset Your SkinSense Password",
    html: `
      <p>Hi,</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
      <br/>
      <p>— The SkinSense Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
