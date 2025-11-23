export async function POST(req) {
  try {
    // Framer invia MULTIPART/FORM-DATA
    const formData = await req.formData();

    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const email = formData.get("email") || "";
    const category = formData.get("category") || "";

    // ---------------------------------------
    // 1️⃣  Costruzione dati cliente
    // ---------------------------------------
    const customerPayload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      tags: [`categoria:${category}`],
      metafields: [
        {
          namespace: "custom",
          key: "categoria_newsletter",
          type: "single_line_text_field",
          value: category
        }
      ]
    };

    // ---------------------------------------
    // 2️⃣  Tentiamo di creare il cliente
    // ---------------------------------------
    const createRes = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ customer: customerPayload }),
      }
    );

    const createData = await createRes.json();

    // ---------------------------------------
    // 3️⃣  Se il cliente esiste già → aggiorniamo solo metafield + tag
    // ---------------------------------------
    if (createData.errors?.email?.includes("has already been taken")) {
      console.log("Customer exists → updating metafield…");

      // Recuperiamo l'ID cliente
      const existingRes = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers/search.json?query=email:${email}`,
        {
          headers: {
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          },
        }
      );

      const existingData = await existingRes.json();
      const customer = existingData.customers?.[0];
      if (!customer)
        return Response.json({ ok: false, error: "Customer not found after duplicate error" });

      const customerId = customer.id;

      // ---------------------------------------
      // PATCH → aggiorna solo ciò che serve
      // ---------------------------------------
      const updateRes = await fetch(
        `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/customers/${customerId}.json`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            customer: {
              id: customerId,
              tags: [...customer.tags.split(", "), `categoria:${category}`],
              metafields: [
                {
                  namespace: "custom",
                  key: "categoria_newsletter",
                  type: "single_line_text_field",
                  value: category
                }
              ]
            }
          }),
        }
      );

      const updateData = await updateRes.json();

      return Response.json({
        ok: true,
        updated: true,
        customerId,
        data: updateData
      });
    }

    // ---------------------------------------
    // 4️⃣  Cliente creato con successo
    // ---------------------------------------
    return Response.json({ ok: true, created: true, data: createData });

  } catch (error) {
    console.error("Newsletter API error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 400 });
  }
}
