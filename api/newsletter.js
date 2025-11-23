export async function POST(req) {
  try {
    let firstName = "";
    let lastName = "";
    let email = "";
    let category = "";

    const contentType = req.headers.get("content-type") || "";

    // 1) Se è form-data → usa formData()
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      firstName = form.get("firstName") || "";
      lastName = form.get("lastName") || "";
      email = form.get("email") || "";
      category = form.get("category") || "";
    }

    // 2) Se è x-www-form-urlencoded → usa req.text()
    else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      firstName = params.get("firstName") || "";
      lastName = params.get("lastName") || "";
      email = params.get("email") || "";
      category = params.get("category") || "";
    }

    // 3) Se è JSON → usa req.json()
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      firstName = body.firstName || "";
      lastName = body.lastName || "";
      email = body.email || "";
      category = body.category || "";
    }

    else {
      throw new Error("Unsupported Content-Type: " + contentType);
    }

    // Shopify customer object
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],
      metafields: [
        {
          key: "categoria_newsletter",
          namespace: "custom",
          value: category,
          type: "single_line_text_field",
        },
      ],
    };

    const response = await fetch(
      "https://mito-store.myshopify.com/admin/api/2023-07/customers.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ customer }),
      }
    );

    const data = await response.json();
    return Response.json({ ok: true, data });

  } catch (error) {
    console.error("Newsletter API error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
