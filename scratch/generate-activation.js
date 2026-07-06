import fs from "fs";
import path from "path";
import crypto from "crypto";

const CONFIG_FILE = path.join(process.cwd(), "device-config.json");

function generateActivationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes expiry

  let config = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    } catch (e) {
      console.warn("⚠️ Warning: Failed to parse existing device-config.json, resetting.");
    }
  }

  config.activationKey = {
    key: token,
    expires: expires
  };

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");

  console.log("\n=======================================================");
  console.log("🔒 INCROUTE ADMIN DEVICE ACTIVATION TOKEN GENERATOR");
  console.log("=======================================================");
  console.log(`Token:      ${token}`);
  console.log(`Expires:    ${expires} (15 minutes)`);
  console.log("\nTo whitelist this PC, visit the following URL in your browser:");
  console.log(`👉 http://localhost:3000/admin-setup?key=${token}`);
  console.log("=======================================================\n");
}

generateActivationToken();
