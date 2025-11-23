export async function POST(req) {
  try {
    // Framer invia MULTIPART/FORM-DATA
    const formData = await req.formData();

    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const email = formData.get("email") || "";
    const category = formData.get("category") || "";

    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],
    };

    const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ customer }),
    });

    const data = await response.json();

    // se Shopify risponde errore → NON mandiamo 500 → Framer non si incazza
    if (!response.ok) {
      return new Response(JSON.stringify({ ok: false, shopifyError: data }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
