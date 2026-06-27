import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
            select: false,
        },
        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        profileImage: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
        },
        coverImage: {
            url: { type: String, default: "" },
            publicId: { type: String, default: "" },
        },
        bio: {
            type: String,
            maxlength: [500, "Bio cannot be more than 500 characters"],
        },
        city: { type: String },
        state: { type: String },
        country: { type: String, default: "India" },
        gender: {
            type: String,
            enum: ["male", "female", "other", ""],
            default: "",
        },
        dob: {
            type: Date,
        },
        preferences: {
            tripTypes: [{ type: String }],
            budgetRange: { type: String, enum: ["budget", "moderate", "luxury", ""] },
            interests: [{ type: String }],
        },
        socialLinks: {
            facebook: { type: String },
            instagram: { type: String },
            twitter: { type: String },
            youtube: { type: String },
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationToken: { type: String, select: false },
        verificationTokenExpiry: { type: Date, select: false },
        resetPasswordToken: { type: String, select: false },
        resetPasswordExpiry: { type: Date, select: false },
        lastLoginAt: { type: Date },
        loginCount: { type: Number, default: 0 },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes for fast lookups and sorting
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ authProvider: 1 });
userSchema.index({ verificationToken: 1 }, { sparse: true });
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Verification Token
userSchema.methods.getVerificationToken = function () {
    const token = crypto.randomBytes(20).toString("hex");
    this.verificationToken = crypto.createHash("sha256").update(token).digest("hex");
    this.verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;