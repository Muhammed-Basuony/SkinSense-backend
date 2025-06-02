import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationCodeEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "SkinSense Password Reset Code",
    html: `
      <p>Hello,</p>
      <p>Your 4-digit password reset code is:</p>
      <h2>${code}</h2>
      <p>This code will expire in 5 minutes.</p>
      <br/>
      <p>– The SkinSense Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
