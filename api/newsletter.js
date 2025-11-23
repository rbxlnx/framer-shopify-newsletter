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

    // LOG per capire cosa arriva a Vercel
    console.log("Incoming form data:", { firstName, lastName, email, category });
    console.log("Calling Shopify:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ customer }),
    });

    const data = await response.json();

    // LOG dell'errore Shopify (se c'è)
    if (!response.ok) {
      console.error("Shopify error:", data);

      return new Response(JSON.stringify({
        ok: false,
        shopifyError: data
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Risposta OK verso Framer
    return new Response(JSON.stringify({
      ok: true,
      data
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected server error:", error);

    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 400, // IMPORTANTE → NO 500 per Framer
      headers: { "Content-Type": "application/json" },
    });
  }
}
