const fs = require("fs");
const path = require("path");

const blogFilePath = path.join(__dirname, "..", "blog-posts.json");
if (!fs.existsSync(blogFilePath)) {
  console.log("blog-posts.json does not exist at", blogFilePath);
  process.exit(1);
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number") return { integerValue: val.toString() };
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map(toFirestoreValue)
      }
    };
  }
  return { stringValue: JSON.stringify(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const key in obj) {
    if (obj[key] !== undefined && key !== "id") {
      fields[key] = toFirestoreValue(obj[key]);
    }
  }
  return { fields };
}

async function migrate() {
  try {
    const posts = JSON.parse(fs.readFileSync(blogFilePath, "utf-8"));
    console.log(`Starting migration for ${posts.length} posts to Firestore...`);

    for (const post of posts) {
      console.log(`Syncing post: id="${post.id}", title="${post.title.substring(0, 30)}...", image="${post.image}"`);
      const payload = toFirestoreFields(post);
      const url = `https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs/${post.id}`;
      
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`🟢 Successfully synced post ${post.id} to Firestore.`);
      } else {
        const errorText = await response.text();
        console.error(`🔴 Failed to sync post ${post.id}. Status: ${response.status}. Error: ${errorText}`);
      }
    }
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

migrate();
