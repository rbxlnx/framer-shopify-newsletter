export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nome, cognome, email, categoria } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email mancante" });
  }

  try {
    const response = await fetch(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/customers.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({
          customer: {
            first_name: nome || "",
            last_name: cognome || "",
            email: email,                             // <<< OBBLIGATORIO
            tags: `Categoria: ${categoria || "Altro"}` // <<< OBBLIGATORIO
          }
        }),
      }
    );

    const data = await response.json();
    return res.status(response.ok ? 200 : 400).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
