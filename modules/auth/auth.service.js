import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../user/user.model.js";
import { ROLES, LOCK_TIME, MAX_FAILED_ATTEMPTS } from "../../common/utils/constants.js";
import { AppError } from "../../common/utils/appError.js";

// Registration Logic
export const createUser = async (data) => {
    const { name, email, phone, password } = data;

    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError("User already exists!", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: ROLES.USER,
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
    });

    return { user, verificationToken };
};

// Login Logic
export const existingUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email }).select("+password +role");

    if (!user) {
        throw new AppError("User does not exist!", 404);
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new AppError(`Account is locked. Try again in ${remaining} minutes.`, 403);
    }

    // Check if account is active
    if (!user.isActive) {
        throw new AppError("Your account has been deactivated. Contact support.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        user.failedLoginAttempts += 1;

        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockUntil = Date.now() + LOCK_TIME;
        }

        await user.save();
        throw new AppError("Invalid credentials!", 401);
    }

    // Reset login attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    user.password = undefined;
    return user;
};

// Forgot Password Logic
export const generatePasswordResetToken = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("No user found with this email!", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    return { user, resetToken };
};

// Reset Password Logic
export const resetUserPassword = async (token, newPassword) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpiry");

    if (!user) {
        throw new AppError("Invalid or expired reset token!", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return user;
};

// Verify Email Logic
export const verifyUserEmail = async (token) => {
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() },
    }).select("+verificationToken +verificationTokenExpiry");

    if (!user) {
        throw new AppError("Invalid or expired verification token!", 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return user;
};