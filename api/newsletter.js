export async function POST(req) {
  try {
    // 🔥 Leggi FormData dal form Framer
    const formData = await req.formData();

    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const email = formData.get("email") || "";
    const category = formData.get("category") || "";

    // 🔥 Costruzione customer per Shopify
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],
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

    return Response.json({ ok: true, shopify: data });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}
