export async function POST(req) {
  try {
    const body = await req.json();

    const firstName = body.firstName || "";
    const lastName = body.lastName || "";
    const email = body.email || "";
    const category = body.category || "";

    console.log("Incoming JSON from Framer:", body);

    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,

      // ⭐ NEW: iscrizione automatica alle email Shopify
      email_marketing_consent: {
        state: "subscribed",
        opt_in_level: "single_opt_in"
      },

      tags: [`categoria:${category}`],
    };

    const url = `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json`;

    console.log("Calling Shopify:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({ customer }),
    });

    const data = await response.json().catch(() => ({}));

    // ⭐ Se il cliente esiste già → NON errore
    if (response.status === 422 || response.status === 409) {
      console.warn("Shopify says customer exists already:", data);
      return new Response(JSON.stringify({ ok: true, alreadyExists: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ⭐ Gestione errori reali
    if (!response.ok) {
      console.error("Shopify error:", data);
      return new Response(JSON.stringify({ ok: false, shopifyError: data }), {
        status: 200, // Framer vuole comunque successo
        headers: { "Content-Type": "application/json" },
      });
    }

    // ⭐ Successo pieno
    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Unexpected server error:", error);

    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 200, // Evita errori Framer
      headers: { "Content-Type": "application/json" },
    });
  }
}
