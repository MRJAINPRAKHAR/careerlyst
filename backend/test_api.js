const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const token = jwt.sign({ id: 2 }, process.env.JWT_SECRET || "super_secret_change_later_123", { expiresIn: "100h" });

async function testParse() {
  try {
    const form = new FormData();
    fs.writeFileSync("/tmp/dummy.pdf", "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    form.append("resume", fs.createReadStream("/tmp/dummy.pdf"));
    
    console.log("Sending request to https://careerlyst-api.onrender.com/api/auth/parse ...");
    const res = await axios.post("https://careerlyst-api.onrender.com/api/auth/parse", form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log("Error:", err.message);
    }
  }
}
testParse();
