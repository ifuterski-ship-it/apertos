import type { OrderRecord } from "@/lib/orders";
import { getProductById } from "@/lib/products";

const WIX_ORDERS_URL = "https://www.wixapis.com/ecom/v1/orders";
const WIX_STORES_APP_ID = "1380bb76-6100-5030-9176-3012e30ae49f";

export function hasWixStoreEnv() {
  return Boolean(
    process.env.WIX_API_KEY &&
    process.env.WIX_SITE_ID
  );
}

export function getWixStoreProductMap(): Record<string, string> {
  const raw = process.env.WIX_STORE_PRODUCT_MAP ?? "";
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const map: Record<string, string> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim()) {
        map[key] = value.trim();
      }
    }

    return map;
  } catch {
    return {};
  }
}

function splitName(fullName: string | null) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Customer", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

type WixStoreOrderResult = {
  ok: boolean;
  message?: string;
  orderId?: string;
  orderUrl?: string;
};

export async function createWixStoreOrder(
  order: OrderRecord,
  productMap: Record<string, string>
): Promise<WixStoreOrderResult> {
  const apiKey = process.env.WIX_API_KEY ?? "";
  const siteId = process.env.WIX_SITE_ID ?? "";

  if (!apiKey || !siteId) {
    return { ok: false, message: "Wix is not configured." };
  }

  const payload = order.parsedItemsPayload;
  const address = payload.shippingAddress;

  if (!address?.address1 || !address.city || !address.postalCode || !address.country) {
    return { ok: false, message: "This order is missing a shipping address." };
  }

  if (!address.email && !order.email) {
    return { ok: false, message: "This order has no customer email on record." };
  }

  const podItems = payload.items.filter((item) => {
    const product = getProductById(item.productId);
    return product?.category === "Outerwear";
  });

  if (podItems.length === 0) {
    return { ok: false, message: "This order has no POD items." };
  }

  for (const item of podItems) {
    if (!productMap[item.productId]) {
      return {
        ok: false,
        message: `Wix product not mapped for "${item.name}" (ID: ${item.productId}). Set WIX_STORE_PRODUCT_MAP.`
      };
    }
  }

  const name = splitName(address.name);
  const email = address.email ?? order.email ?? "";

  const wixAddress = {
    addressLine1: address.address1 ?? "",
    addressLine2: address.address2 ?? "",
    city: address.city ?? "",
    country: (address.country ?? "").toUpperCase(),
    postalCode: address.postalCode ?? "",
    subdivision: address.state ?? ""
  };

  const lineItems = podItems.map((item) => {
    const options = [{ option: "Size", choices: [item.size] }];
    if (item.colour) {
      options.push({ option: "Colour", choices: [item.colour] });
    }

    return {
      quantity: item.quantity,
      productName: { original: item.name },
      catalogReference: {
        catalogItemId: productMap[item.productId],
        appId: process.env.WIX_STORES_APP_ID ?? WIX_STORES_APP_ID,
        catalogItemOptions: { options }
      },
      itemType: { preset: "PHYSICAL" },
      price: { amount: String(item.price), currency: "GBP" },
      taxInfo: {
        taxAmount: { amount: "0", currency: "GBP" },
        taxableAmount: { amount: String(item.price), currency: "GBP" },
        taxRate: "0",
        taxIncludedInPrice: false
      }
    };
  });

  const totalAmount = String(
    podItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  let response: Response;
  try {
    response = await fetch(WIX_ORDERS_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "wix-site-id": siteId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        order: {
          lineItems,
          channelInfo: {
            type: "OTHER_PLATFORM",
            externalOrderId: order.stripeCheckoutSessionId
          },
          priceSummary: {
            total: { amount: totalAmount, currency: "GBP" }
          },
          currencyConversionDetails: {
            originalCurrency: "GBP",
            conversionRate: "1"
          },
          billingInfo: {
            contactDetails: {
              firstName: name.firstName,
              lastName: name.lastName,
              email,
              phone: address.phone ?? ""
            },
            address: wixAddress
          },
          shippingInfo: {
            shipmentDetails: {
              address: wixAddress
            }
          },
          status: "APPROVED",
          paymentStatus: "PAID"
        },
        settings: {
          notifications: {
            sendNotificationToBuyer: false,
            sendNotificationsToBusiness: true
          }
        }
      })
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach Wix.";
    return { ok: false, message };
  }

  if (!response.ok) {
    let wixMessage = `Wix API error ${response.status}`;
    try {
      const errorData = (await response.json()) as {
        message?: string;
        details?: { message?: string };
      };
      if (errorData.details?.message) {
        wixMessage += `: ${errorData.details.message}`;
      } else if (errorData.message) {
        wixMessage += `: ${errorData.message}`;
      }
    } catch {
      // ignore parse error
    }
    return { ok: false, message: wixMessage };
  }

  let result: { order?: { id?: string; _id?: string } };
  try {
    result = (await response.json()) as { order?: { id?: string; _id?: string } };
  } catch {
    return { ok: false, message: "Wix returned an invalid response." };
  }

  const orderId = result.order?.id ?? result.order?._id;
  if (!orderId) {
    return { ok: false, message: "Wix did not return an order ID." };
  }

  return {
    ok: true,
    orderId,
    orderUrl:
      process.env.WIX_DASHBOARD_URL ??
      `https://www.wix.com/dashboard/${siteId}/stores/orders/${orderId}`
  };
}