export async function initializePaystackCheckout(
  paymentRequestId: string,
  idToken: string
): Promise<string> {
  const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL as string | undefined;

  if (!functionsBaseUrl) {
    throw new Error("Online checkout is not configured yet.");
  }

  const response = await fetch(
    `${functionsBaseUrl.replace(/\/$/, "")}/initializePaystackCheckout`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentRequestId }),
    }
  );

  const payload = (await response.json()) as {
    checkoutUrl?: string;
    error?: string;
  };

  if (!response.ok || !payload.checkoutUrl) {
    throw new Error(payload.error || "Could not start online checkout.");
  }

  return payload.checkoutUrl;
}