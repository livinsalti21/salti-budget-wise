import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const PLAN_MAPPING = {
  [Deno.env.get("STRIPE_PRICE_PRO_MONTH") || ""]: { plan: "Pro", interval: "month" },
  [Deno.env.get("STRIPE_PRICE_PRO_YEAR") || ""]: { plan: "Pro", interval: "year" },
  [Deno.env.get("STRIPE_PRICE_FAMILY_MONTH") || ""]: { plan: "Family", interval: "month" },
};

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();
  
  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, {
      status: 400,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;
        
        if (!userId) {
          console.error("No user ID found in checkout session");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0].price.id;
        const planInfo = PLAN_MAPPING[priceId];

        if (planInfo) {
          await supabaseClient
            .from("profiles")
            .update({
              plan: planInfo.plan,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          console.log(`Updated user ${userId} to ${planInfo.plan} plan`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0].price.id;
        const planInfo = PLAN_MAPPING[priceId];

        if (planInfo) {
          await supabaseClient
            .from("profiles")
            .update({
              plan: planInfo.plan,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId);

          console.log(`Updated subscription for customer ${customerId} to ${planInfo.plan}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await supabaseClient
          .from("profiles")
          .update({
            plan: "Free",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId);

        console.log(`Downgraded customer ${customerId} to Free plan`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        // You could add notification logic here
        console.log(`Payment failed for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(`Webhook processing failed: ${error.message}`, {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});