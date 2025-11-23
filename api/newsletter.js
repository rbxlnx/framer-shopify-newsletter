import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email mancante" }, { status: 400 });
    }

    const shopifyResponse = await fetch(
      "https://tuo-store.myshopify.com/admin/api/2024-01/customers.json",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API!,
        },
        body: JSON.stringify({
          customer: {
            email,
            accepts_marketing: true
          }
        })
      }
    );

    const data = await shopifyResponse.json();

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
