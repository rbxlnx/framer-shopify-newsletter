export async function POST(req) {
  try {
    console.log("🔔 Newsletter API hit");

    let firstName = "";
    let lastName = "";
    let email = "";
    let category = "";

    const contentType = req.headers.get("content-type") || "";

    console.log("📦 Content-Type:", contentType);

    // --- CASE 1: multipart/form-data (Framer vecchio) ---
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      firstName = formData.get("firstName") || "";
      lastName = formData.get("lastName") || "";
      email = formData.get("email") || "";
      category = formData.get("category") || "";
      console.log("📥 Parsed from FORM-DATA:", { firstName, lastName, email, category });
    }

    // --- CASE 2: JSON (Framer nuovo) ---
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      firstName = body.firstName || "";
      lastName = body.lastName || "";
      email = body.email || "";
      category = body.category || "";
      console.log("📥 Parsed from JSON:", { firstName, lastName, email, category });
    }

    // --- CASE 3: Unknown format ---
    else {
      console.log("❌ Unsupported Content-Type");
      return Response.json(
        { ok: false, error: "Unsupported Content-Type" },
        { status: 400 }
      );
    }

    // --- Validate email ---
    if (!email || !email.includes("@")) {
      console.log("❌ Invalid or missing email");
      return Response.json(
        { ok: false, error: "Missing or invalid email" },
        { status: 400 }
      );
    }

    // --- Shopify customer payload ---
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],
      metafields: [
        {
          namespace: "custom",
          key: "categoria_newsletter",
          value: category,
          type: "single_line_text_field"
        }
      ]
    };

    console.log("🚀 Sending to Shopify:", customer);

    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({ customer })
      }
    );

    const data = await response.json();

    console.log("📨 Shopify response:", data);

    return Response.json({ ok: true, data });

  } catch (error) {
    console.error("💥 Newsletter API error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
