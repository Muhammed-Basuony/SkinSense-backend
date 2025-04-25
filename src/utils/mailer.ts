import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587, 
    auth: {
      user:"2b16cf4d4a7961",
      pass: "6718db1a73a0af",
    },
  });
  
