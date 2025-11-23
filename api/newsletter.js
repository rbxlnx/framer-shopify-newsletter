export async function POST(req) {
  try {
    let data = {}

    // 1️⃣ PROVA A LEGGERE FORM-DATA (Framer a volte usa questo formato)
    try {
      const form = await req.formData()
      form.forEach((value, key) => {
        data[key] = value
      })
    } catch (e) {
      // Ignora l’errore: significa che NON è form-data
    }

    // 2️⃣ SE NON È FORM-DATA, PROVA A LEGGERE JSON
    if (!data.email) {
      try {
        data = await req.json()
      } catch (e) {
        return Response.json({ ok: false, error: "Invalid body format" }, { status: 400 })
      }
    }

    const firstName = data.firstName || ""
    const lastName = data.lastName || ""
    const email = data.email || ""
    const category = data.category || ""

    if (!email) {
      return Response.json({ ok: false, error: "Missing email" }, { status: 400 })
    }

    // 3️⃣ PREPARA IL CLIENTE PER SHOPIFY
    const customer = {
      first_name: firstName,
      last_name: lastName,
      email: email,
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
    }

    // 4️⃣ INVIA A SHOPIFY
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
    )

    const shopifyRes = await response.json()
    console.log("📨 Shopify response:", shopifyRes)

    if (!response.ok) {
      return Response.json({ ok: false, error: shopifyRes }, { status: 400 })
    }

    return Response.json({ ok: true, data: shopifyRes })
  } catch (error) {
    console.error("Newsletter API error:", error)
    return Response.json({ ok: false, error: error.message }, { status: 400 })
  }
}
