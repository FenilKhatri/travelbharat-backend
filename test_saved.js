import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => console.log("Connected")).catch(console.error);

const SavedBlogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
});
const SavedBlog = mongoose.models.SavedBlog || mongoose.model("SavedBlog", SavedBlogSchema);

async function run() {
    const saved = await SavedBlog.find({});
    console.log("Saved blogs in DB:", saved);
    process.exit();
}
setTimeout(run, 3000);
