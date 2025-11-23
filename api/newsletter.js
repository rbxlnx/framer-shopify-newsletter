export async function POST(req) {
  try {
    // Framer invia MULTIPART/FORM-DATA
    const formData = await req.formData();

    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const email = formData.get("email") || "";
    const category = formData.get("category") || "";

    // Customer object completo
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],

      // 🔥 ISCRIZIONE ALLA NEWSLETTER → QUESTA È LA PARTE CHE MANCA NEI TUOI LOG
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in",
      },

      // 🔥 METAFIELD personalizzato categoria_newsletter
      metafields: [
        {
          key: "categoria_newsletter",
          namespace: "custom",
          type: "single_line_text_field",
          value: category,
        },
      ],
    };

    const response = await fetch(
      "https://c3e1a4-0b.myshopify.com/admin/api/2025-10/customers.json",
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
    console.error("Newsletter API error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
