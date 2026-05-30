import { getAccessToken } from './firebase';

export async function createGoogleForm(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error("No Google access token found. Please sign in again.");

  try {
    // 1. Create the Form
    const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        info: {
          title: "Incroute Contact Us",
          documentTitle: "Contact Us - Incroute Leads"
        }
      })
    });
    const form = await createRes.json();

    if (!form.formId) {
      console.error("Failed to create form", form);
      const errMsg = form.error?.message || JSON.stringify(form);
      throw new Error(errMsg);
    }

    const formId = form.formId;
    const responderUri = form.responderUri;

    // 2. Add Questions via batchUpdate
    const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            createItem: {
              item: {
                title: "Full Name",
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: "Email Address",
                questionItem: { question: { required: true, textQuestion: { paragraph: false } } }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: "Phone Number",
                questionItem: { question: { required: false, textQuestion: { paragraph: false } } }
              },
              location: { index: 2 }
            }
          },
          {
            createItem: {
              item: {
                title: "Your Message",
                questionItem: { question: { required: true, textQuestion: { paragraph: true } } }
              },
              location: { index: 3 }
            }
          }
        ]
      })
    });

    const updateData = await updateRes.json();
    if (updateData.error) {
      throw new Error(`Failed to configure form questions: ${updateData.error.message}`);
    }

    return responderUri;
  } catch (err: any) {
    console.error("Setup form error", err);
    throw err;
  }
}
