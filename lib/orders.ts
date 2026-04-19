import { createClient } from "@/lib/supabase/server";

type RecordedOrder = {
  email: string | null;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string | null;
  amountTotal: number | null;
  currency: string | null;
  items: string;
  paymentStatus: string | null;
};

export async function recordOrder(order: RecordedOrder) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("orders").insert(order);

    if (error) {
      console.warn("Unable to record order in Supabase:", error.message);
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.warn("Order recording skipped:", error);
    return { ok: false, message: "Order recording unavailable." };
  }
}
