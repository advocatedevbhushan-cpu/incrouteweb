async function run() {
  const contactFormUri = "https://docs.google.com/forms/d/e/1FAIpQLSf_I-0yjXKhV_oJDi2KMpzSrFUnqZF3p_MQJ5oo28dOQ-_0yA/viewform";
  const postUrl = contactFormUri.replace("/viewform", "/formResponse");
  
  console.log("Post URL:", postUrl);
  
  const entryIds = [ '76481167', '373844415', '542528102', '922129478' ];
  const name = "Test Auto Submitter";
  const email = "auto@example.com";
  const phone = "+919999999999";
  const message = "This is a test message from automation";

  const params = new URLSearchParams();
  params.append(`entry.${entryIds[0]}`, name);
  params.append(`entry.${entryIds[1]}`, email);
  params.append(`entry.${entryIds[2]}`, phone);
  params.append(`entry.${entryIds[3]}`, message);

  console.log("Submitting with body:", params.toString());

  try {
    const response = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: params.toString()
    });

    console.log("Response Status:", response.status, response.statusText);
    const text = await response.text();
    console.log("Response text snippet (first 500 chars):", text.slice(0, 500));
    
    if (text.includes("Your response has been recorded") || text.includes("has been recorded") || response.ok) {
      console.log("🟢 Success detected in response text!");
    } else {
      console.log("🔴 Failure detected in response text.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

run();
