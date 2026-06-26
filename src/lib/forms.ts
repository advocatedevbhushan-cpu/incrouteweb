// Google Forms integration — no longer uses Firebase auth
// Contact form submissions go directly to the server API

export async function createGoogleForm(): Promise<string> {
  // This function is no longer needed — contact form submits to /api/contact
  return "";
}
