async function testGet() {
  const url = "https://firestore.googleapis.com/v1/projects/legiscorp-registrations/databases/(default)/documents/blogs";
  try {
    const response = await fetch(url);
    console.log(`GET Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`Number of documents retrieved: ${data.documents ? data.documents.length : 0}`);
    } else {
      console.log(`GET Error: ${await response.text()}`);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
testGet();
