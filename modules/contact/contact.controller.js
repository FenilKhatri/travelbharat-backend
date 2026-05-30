import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { sendEmail, getContactConfirmationEmail } from "../../config/email.js";
import ContactInquiry from "./contact.model.js";

// Public: Submit contact form
export const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return errorResponse(res, 400, "Name, email, subject, and message are required");
    }

    const inquiry = await ContactInquiry.create({ name, email, phone, subject, message });

    // Send confirmation email
    try {
        const emailContent = getContactConfirmationEmail(name);
        await sendEmail({ to: email, ...emailContent });
    } catch (err) {
        console.error("Contact confirmation email failed:", err.message);
    }

    return successResponse(res, 201, "Message sent! We'll get back to you soon.", { inquiry });
});

// Admin: Get all inquiries
export const getAllInquiries = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await ContactInquiry.countDocuments(query);
    const inquiries = await ContactInquiry.find(query)
        .sort("-createdAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Inquiries fetched", {
        inquiries,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// Admin: Get single inquiry
export const getInquiry = asyncHandler(async (req, res) => {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) return errorResponse(res, 404, "Inquiry not found");

    // Mark as read
    if (inquiry.status === "new") {
        inquiry.status = "read";
        await inquiry.save();
    }

    return successResponse(res, 200, "Inquiry fetched", { inquiry });
});

// Admin: Update inquiry status
export const updateInquiryStatus = asyncHandler(async (req, res) => {
    const { status, adminNotes } = req.body;
    const update = { status };
    if (adminNotes) update.adminNotes = adminNotes;
    if (status === "replied") update.repliedAt = new Date();

    const inquiry = await ContactInquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!inquiry) return errorResponse(res, 404, "Inquiry not found");
    return successResponse(res, 200, "Inquiry updated", { inquiry });
});

// Admin: Delete inquiry
export const deleteInquiry = asyncHandler(async (req, res) => {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return errorResponse(res, 404, "Inquiry not found");
    return successResponse(res, 200, "Inquiry deleted");
});

// Admin: Get inquiry stats
export const getInquiryStats = asyncHandler(async (req, res) => {
    const total = await ContactInquiry.countDocuments();
    const newCount = await ContactInquiry.countDocuments({ status: "new" });
    const readCount = await ContactInquiry.countDocuments({ status: "read" });
    const repliedCount = await ContactInquiry.countDocuments({ status: "replied" });

    return successResponse(res, 200, "Stats fetched", { total, new: newCount, read: readCount, replied: repliedCount });
});
