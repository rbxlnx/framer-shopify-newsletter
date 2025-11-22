export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email mancante" });
    }

    const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-10";

    const shopifyEndpoint = `https://${shopDomain}/admin/api/${apiVersion}/customers.json`;

    const response = await fetch(shopifyEndpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          tags: "newsletter",
          email_marketing_consent: {
            state: "subscribed",
            opt_in_level: "single_opt_in",
            consent_updated_at: new Date().toISOString(),
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Errore Shopify:", data);
      return res.status(400).json({ error: "Impossibile creare il cliente Shopify", details: data });
    }

    return res.status(200).json({ success: true, shopifyResponse: data });
  } catch (error) {
    console.error("Errore server:", error);
    return res.status(500).json({ error: "Errore interno server" });
  }
}
