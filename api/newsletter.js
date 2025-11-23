export async function POST(req) {
  try {
    let firstName = "";
    let lastName = "";
    let email = "";
    let category = "";

    const contentType = req.headers.get("content-type") || "";

    // 1) SE FRAMER MANDA multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      firstName = formData.get("firstName")?.trim() || "";
      lastName = formData.get("lastName")?.trim() || "";
      email = formData.get("email")?.trim() || "";
      category = formData.get("category")?.trim() || "";
    }

    // 2) SE FRAMER MANDA JSON
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      firstName = body.firstName?.trim() || "";
      lastName = body.lastName?.trim() || "";
      email = body.email?.trim() || "";
      category = body.category?.trim() || "";
    }

    // 3) Tipo sconosciuto
    else {
      return Response.json(
        { ok: false, error: "Unsupported Content-Type", type: contentType },
        { status: 400 }
      );
    }

    // 🔒 SICUREZZA: controllo email
    if (!email) {
      return Response.json(
        { ok: false, error: "Missing email" },
        { status: 400 }
      );
    }

    // 🧱 COSTRUZIONE PAYLOAD SHOPIFY
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email,
      tags: [`categoria:${category}`],
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in"
      },
      metafields: [
        {
          key: "categoria_newsletter",
          namespace: "custom",
          type: "single_line_text_field",
          value: category
        }
      ]
    };

    // 🔗 chiamata API Shopify
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

    // 📩 Debug log
    console.log("Shopify response:", JSON.stringify(data, null, 2));

    return Response.json({ ok: true, data });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return Response.json(
      { ok: false, error: error.message },
      { status: 400 }
    );
  }
}
