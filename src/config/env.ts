import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: process.env.SMTP_PORT as string,
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    MAIL_FROM: process.env.MAIL_FROM as string,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID as string,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET as string,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET as string,
};