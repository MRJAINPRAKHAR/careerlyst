require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
    console.log("Testing Cloudinary with:");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING");

    try {
        const result = await cloudinary.api.ping();
        console.log("SUCCESS: Cloudinary Ping Result:", result);
    } catch (error) {
        console.error("FAILURE: Cloudinary Diagnostic Error:", error);
    }
}

testCloudinary();
