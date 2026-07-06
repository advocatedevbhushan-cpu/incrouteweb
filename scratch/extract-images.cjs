const fs = require("fs");
const path = require("path");

const blogFilePath = path.join(__dirname, "..", "blog-posts.json");
const outputDir = path.join(__dirname, "..", "public", "blog-images");

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  const fileContent = fs.readFileSync(blogFilePath, "utf8");
  const posts = JSON.parse(fileContent);
  let updatedCount = 0;

  posts.forEach((post) => {
    if (post.image && post.image.startsWith("data:")) {
      const match = post.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === "jpeg" ? "jpg" : match[1];
        const base64Data = match[2];
        const filename = `${post.id}.${ext}`;
        const outputFilePath = path.join(outputDir, filename);

        // Decode base64 and write file
        fs.writeFileSync(outputFilePath, Buffer.from(base64Data, "base64"));
        console.log(`Saved image for post "${post.id}" to public/blog-images/${filename}`);

        // Update post image reference
        post.image = `/blog-images/${filename}`;
        updatedCount++;
      }
    }
  });

  if (updatedCount > 0) {
    fs.writeFileSync(blogFilePath, JSON.stringify(posts, null, 2), "utf-8");
    console.log(`Successfully updated blog-posts.json. Extracted ${updatedCount} images.`);
    console.log(`Original file size: ${fileContent.length} bytes`);
    console.log(`New file size: ${fs.readFileSync(blogFilePath, "utf8").length} bytes`);
  } else {
    console.log("No base64 inline images found to extract.");
  }
} catch (err) {
  console.error("Error processing blog-posts.json:", err);
}
