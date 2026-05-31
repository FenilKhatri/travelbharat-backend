import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { createUser, existingUser, generatePasswordResetToken, resetUserPassword, verifyUserEmail } from "./auth.service.js";
import User from "../user/user.model.js";
import generateToken from "../../common/utils/generateToken.utils.js";
import { ROLES } from "../../common/utils/constants.js";
import { setAuthCookie, clearAuthCookie } from "../../common/utils/cookie.utils.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { sendEmail, getWelcomeEmail, getVerificationEmail, getPasswordResetEmail } from "../../config/email.js";
import admin from "../../config/firebaseAdmin.js";
import Notification from "../notification/notification.model.js";

// Register
export const register = asyncHandler(async (req, res) => {
    const { user, verificationToken } = await createUser(req.body);

    const token = generateToken(user);
    setAuthCookie(res, token);

    // Send welcome email
    try {
        const emailContent = getWelcomeEmail(user.name);
        await sendEmail({ to: user.email, ...emailContent });
    } catch (err) {
        console.error("Welcome email failed:", err.message);
    }

    await Notification.create({
        title: "New User Registration",
        message: `${user.name} has joined the platform.`,
        type: "system",
        link: `/admin/users`
    });

    return successResponse(res, 201, "User registered successfully!", { user });
});

// Login
export const login = asyncHandler(async (req, res) => {
    const user = await existingUser(req.body);

    const token = generateToken(user);
    setAuthCookie(res, token);

    return successResponse(res, 200, "Login successful!", { user });
});

// OAuth with Google (Firebase)
export const googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return errorResponse(res, 400, "Token missing");
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decoded;

    let user = await User.findOne({ email });

    if (user) {
        if (!user.isActive) {
            return errorResponse(res, 403, "Your account has been deactivated.");
        }
        const jwtToken = generateToken(user);
        setAuthCookie(res, jwtToken);
        return successResponse(res, 200, "Login successful", { user });
    }

    // New user – create with user role only
    user = await User.create({
        name,
        email,
        profileImage: picture,
        role: ROLES.USER,
        authProvider: "google",
        isVerified: true,
        isActive: true,
    });

    // Send welcome email
    try {
        const emailContent = getWelcomeEmail(user.name);
        await sendEmail({ to: user.email, ...emailContent });
    } catch (err) {
        console.error("Welcome email failed:", err.message);
    }

    await Notification.create({
        title: "New User Registration",
        message: `${user.name} has joined via Google.`,
        type: "system",
        link: `/admin/users`
    });

    const jwtToken = generateToken(user);
    setAuthCookie(res, jwtToken);

    return successResponse(res, 201, "Account created successfully", { user });
});

// Get Me
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "User fetched", { user });
});

// Logout
export const logout = (req, res) => {
    clearAuthCookie(res);
    return successResponse(res, 200, "Logout successful!");
};

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return errorResponse(res, 400, "Email is required");
    }

    const { user, resetToken } = await generatePasswordResetToken(email);
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
        const emailContent = getPasswordResetEmail(user.name, resetUrl);
        await sendEmail({ to: user.email, ...emailContent });
    } catch (err) {
        console.error("Reset email failed:", err.message);
        // Don't reveal that email sending failed
    }

    return successResponse(res, 200, "Password reset email sent! Check your inbox.");
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return errorResponse(res, 400, "Password must be at least 6 characters");
    }

    await resetUserPassword(token, password);

    return successResponse(res, 200, "Password reset successful! You can now login.");
});

// Verify Email
export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    await verifyUserEmail(token);

    return successResponse(res, 200, "Email verified successfully!");
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, bio, city, state, profileImage, gender, dob, country } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, bio, city, state, profileImage, gender, dob, country },
        { new: true, runValidators: true }
    );

    if (!user) {
        return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, "Profile updated!", { user });
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return errorResponse(res, 400, "Both current and new password are required");
    }

    if (newPassword.length < 6) {
        return errorResponse(res, 400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
        return errorResponse(res, 404, "User not found");
    }

    if (user.authProvider === "google") {
        return errorResponse(res, 400, "Cannot change password for Google account");
    }

    const isMatch = await (await import("bcrypt")).default.compare(currentPassword, user.password);
    if (!isMatch) {
        return errorResponse(res, 401, "Current password is incorrect");
    }

    const hashedPassword = await (await import("bcrypt")).default.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 200, "Password changed successfully!");
});
