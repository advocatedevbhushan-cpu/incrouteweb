const fs = require("fs");
const path = require("path");

const blogFilePath = path.join(__dirname, "..", "blog-posts.json");
if (!fs.existsSync(blogFilePath)) {
  console.log("blog-posts.json does not exist at", blogFilePath);
  process.exit(1);
}

try {
  const fileContent = fs.readFileSync(blogFilePath, "utf8");
  const posts = JSON.parse(fileContent);
  console.log(`Total posts found: ${posts.length}`);
  
  posts.forEach((post, index) => {
    const hasBase64 = post.image && post.image.startsWith("data:");
    const imgSize = post.image ? post.image.length : 0;
    console.log(`Post [${index + 1}]: id="${post.id}", title="${post.title.substring(0, 40)}...", hasBase64=${hasBase64}, imageLength=${imgSize}`);
  });
} catch (err) {
  console.error("Error reading/parsing blog-posts.json:", err);
}
