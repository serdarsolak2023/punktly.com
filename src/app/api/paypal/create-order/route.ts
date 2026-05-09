import { NextResponse } from "next/server";


async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal ENV fehlt: PAYPAL_CLIENT_ID oder PAYPAL_CLIENT_SECRET.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal Access Token Fehler: ${text}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body.amount || "9.99";

    const accessToken = await getPayPalAccessToken();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "Punktly Freischaltung",
            amount: {
              currency_code: "EUR",
              value: amount
            }
          }
        ],
        application_context: {
          brand_name: "Punktly",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${baseUrl}?paypal=success`,
          cancel_url: `${baseUrl}?paypal=cancel`
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data }, { status: 500 });
    }

    const approvalUrl = data.links?.find((link: any) => link.rel === "approve")?.href;

    return NextResponse.json({
      orderId: data.id,
      approvalUrl
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "PayPal create-order Fehler" }, { status: 500 });
  }
}
