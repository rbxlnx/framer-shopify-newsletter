import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    let email = "";

    // ---- 1) Proviamo a leggere JSON ----
    try {
      const json = await req.json();
      if (json && json.email) {
        email = json.email;
      }
    } catch (_) {
      // ignoriamo l'errore: significa che NON era JSON
    }

    // ---- 2) Se non è JSON, proviamo FormData ----
    if (!email) {
      const formData = await req.formData();
      email = formData.get("email") || "";
    }

    // ---- 3) Se ancora non abbiamo l'email → errore ----
    if (!email) {
      return NextResponse.json(
        { error: "Email mancante" },
        { status: 400 }
      );
    }

    // ---- 4) Chiamata Shopify ----
    const shopifyResponse = await fetch(
      "https://tuo-store.myshopify.com/admin/api/2024-01/customers.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API,
        },
        body: JSON.stringify({
          customer: {
            email,
            accepts_marketing: true,
          },
        }),
      }
    );

    const data = await shopifyResponse.json();
    return NextResponse.json({ ok: true, data });

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
