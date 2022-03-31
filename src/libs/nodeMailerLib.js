import { createTransport } from "nodemailer";

export const transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: process.env.MAIL_HOST_SECURE,
        auth: {
            user: process.env.MAIL_AUTH_USER,
            pass: process.env.MAIL_AUTH_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });