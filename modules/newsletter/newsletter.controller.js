import { asyncHandler } from "../../common/middlewares/async.helper.js";
import { successResponse, errorResponse } from "../../common/utils/responseHandler.utils.js";
import { sendEmail, getNewsletterWelcomeEmail } from "../../config/email.js";
import NewsletterSubscriber from "./newsletter.model.js";

// Subscribe
export const subscribe = asyncHandler(async (req, res) => {
    const { email, source } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return errorResponse(res, 400, "Invalid email format");

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
        if (existing.isActive) {
            return errorResponse(res, 400, "Already subscribed!");
        }
        // Re-subscribe
        existing.isActive = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();
    } else {
        await NewsletterSubscriber.create({ email, source: source || "homepage" });
    }

    // Send welcome email
    try {
        const emailContent = getNewsletterWelcomeEmail(email);
        await sendEmail({ to: email, ...emailContent });
    } catch (err) {
        console.error("Newsletter email failed:", err.message);
    }

    return successResponse(res, 200, "Subscribed successfully! Check your email.");
});

// Unsubscribe
export const unsubscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, "Email is required");

    const subscriber = await NewsletterSubscriber.findOne({ email });
    if (!subscriber) return errorResponse(res, 404, "Email not found");

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return successResponse(res, 200, "Unsubscribed successfully");
});

// Admin: Get all subscribers
export const getAllSubscribers = asyncHandler(async (req, res) => {
    const { active, page = 1, limit = 30 } = req.query;
    const query = {};
    if (active === "true") query.isActive = true;
    if (active === "false") query.isActive = false;

    const total = await NewsletterSubscriber.countDocuments(query);
    const subscribers = await NewsletterSubscriber.find(query)
        .sort("-subscribedAt")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    return successResponse(res, 200, "Subscribers fetched", {
        subscribers,
        pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
});

// Admin: Delete subscriber
export const deleteSubscriber = asyncHandler(async (req, res) => {
    const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) return errorResponse(res, 404, "Subscriber not found");
    return successResponse(res, 200, "Subscriber deleted");
});

// Admin: Get subscriber stats
export const getSubscriberStats = asyncHandler(async (req, res) => {
    const total = await NewsletterSubscriber.countDocuments();
    const active = await NewsletterSubscriber.countDocuments({ isActive: true });
    const inactive = await NewsletterSubscriber.countDocuments({ isActive: false });

    const bySource = await NewsletterSubscriber.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    return successResponse(res, 200, "Stats fetched", { total, active, inactive, bySource });
});

// Admin: Broadcast newsletter
export const broadcastNewsletter = asyncHandler(async (req, res) => {
    const { subject, content } = req.body;
    if (!subject || !content) return errorResponse(res, 400, "Subject and content are required");

    const subscribers = await NewsletterSubscriber.find({ isActive: true });
    if (!subscribers.length) return errorResponse(res, 400, "No active subscribers found");

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
        <div style="background: linear-gradient(135deg, #E85D04, #F48C06); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">TravelBharat Newsletter</h1>
        </div>
        <div style="padding: 30px;">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <div style="color: #555; line-height: 1.6; font-size: 15px;">
                ${content.replace(/\n/g, '<br/>')}
            </div>
        </div>
        <div style="background: #0A1628; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">© ${new Date().getFullYear()} TravelBharat. All rights reserved.</p>
        </div>
    </div>`;

    let successCount = 0;
    for (const sub of subscribers) {
        try {
            await sendEmail({ to: sub.email, subject, html });
            successCount++;
        } catch (err) {
            console.error("Failed to send broadcast to:", sub.email);
        }
    }

    return successResponse(res, 200, `Newsletter broadcasted successfully to ${successCount} subscribers.`);
});
