import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    return transporter;
};

/**
 * Send email using configured SMTP
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: `"TravelBharat" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html,
            text: text || "",
        };

        const t = getTransporter();
        const info = await t.sendMail(mailOptions);
        if (process.env.NODE_ENV === "development") {
            console.log("Email sent:", info.messageId);
        }
        return info;
    } catch (error) {
        console.error("Email send error:", error);
        throw new Error("Failed to send email");
    }
};

// ==========================================
// EMAIL TEMPLATES
// ==========================================

export const getWelcomeEmail = (name) => ({
    subject: "Welcome to TravelBharat – Explore India State by State! 🇮🇳",
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Welcome to TravelBharat! 🏛️</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">Your Gateway to Incredible India</p>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Namaste <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Thank you for joining TravelBharat! We're thrilled to have you as part of our community of travel enthusiasts exploring the incredible beauty of India.
            </p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                From the vibrant streets of Gujarat to the serene backwaters of Kerala, from the majestic forts of Rajasthan to the pristine beaches of Goa – India awaits you.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/states" style="background: linear-gradient(135deg, #E85D04, #F48C06); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                    Start Exploring India
                </a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">Happy Travels! 🌍</p>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`,
});

export const getVerificationEmail = (name, verifyUrl) => ({
    subject: "Verify Your Email – TravelBharat 🇮🇳",
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Verify Your Email ✉️</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Please click the button below to verify your email address and activate your TravelBharat account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background: linear-gradient(135deg, #E85D04, #F48C06); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                    Verify Email Address
                </a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">This link expires in 24 hours.</p>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`,
});

export const getPasswordResetEmail = (name, resetUrl) => ({
    subject: "Reset Your Password – TravelBharat",
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Password Reset 🔒</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                We received a request to reset your password. Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #E85D04, #F48C06); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 13px; color: #999; text-align: center;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`,
});

export const getContactConfirmationEmail = (name) => ({
    subject: "We Received Your Message – TravelBharat",
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Message Received! 📩</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Thank you for reaching out to TravelBharat! We have received your message and our team will get back to you within 24-48 hours.
            </p>
            <p style="font-size: 15px; color: #555;">In the meantime, explore amazing destinations across India!</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #E85D04, #F48C06); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    Explore TravelBharat
                </a>
            </div>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`,
});

export const getNewsletterWelcomeEmail = (email) => ({
    subject: "Welcome to TravelBharat Newsletter! 🇮🇳",
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">You're Subscribed! 🎉</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                You'll now receive the best travel stories, hidden gems, and exclusive destination guides straight to your inbox.
            </p>
            <p style="font-size: 15px; color: #555;">Get ready to discover incredible India! 🌏</p>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`,
});

export default getTransporter;
