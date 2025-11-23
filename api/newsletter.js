export async function POST(req) {
  console.log("🔔 Newsletter API hit");

  let firstName = "";
  let lastName = "";
  let email = "";
  let category = "";

  try {
    // Controllo content-type
    const contentType = req.headers.get("content-type") || "";
    console.log("📦 Content-Type:", contentType);

    // Caso 1: FRAMER → multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      firstName = formData.get("firstName") || "";
      lastName = formData.get("lastName") || "";
      email = formData.get("email") || "";
      category = formData.get("category") || "";
    }

    // Caso 2: JSON → usato per test o altre integrazioni
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      console.log("📥 Parsed from JSON:", body);
      firstName = body.firstName || "";
      lastName = body.lastName || "";
      email = body.email || "";
      category = body.category || "";
    }

    // Nessun formato valido
    else {
      throw new Error("Content-Type non supportato");
    }

    // Customer object
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
          type: "single_line_text_field",
        },
      ],
    };

    console.log("🚀 Sending to Shopify:", customer);

    // CHIAMATA API SHOPIFY
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer }),
      }
    );

    const data = await response.json();

    console.log("📨 Shopify response:", data);

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("❌ Newsletter API error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }
}
