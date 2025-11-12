import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeFunctionLogger } from '../_shared/logger.ts';

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
  const logger = new EdgeFunctionLogger('stripe-webhook');
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
          logger.warn("No user ID in checkout session", { session_id: session.id });
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

          logger.info('Subscription activated', { user_id: userId, plan: planInfo.plan });
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

          logger.info('Subscription updated', { customer_id: customerId, plan: planInfo.plan });
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

        logger.info('Subscription cancelled', { customer_id: customerId });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        
        logger.warn('Payment failed', { customer_id: customerId, invoice_id: invoice.id });
        break;
      }

      default:
        logger.debug('Unhandled event type', { event_type: event.type });
    }
  } catch (error) {
    logger.error('Webhook processing failed', error);
    return new Response(`Webhook processing failed: ${error.message}`, {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});