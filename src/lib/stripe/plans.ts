import { getStripe } from "@/lib/stripe/client";
import { mapPriceToPlan } from "@/lib/stripe/map-price-to-plan";
import { unstable_cache } from "next/cache";
import { StripePlan } from "./plan-types";

async function fetchStripePlans(): Promise<StripePlan[]> {
    const stripe = getStripe();

    const allowedPriceIds = [
        process.env.STRIPE_PRO_PRICE_ID,
        process.env.STRIPE_PRO_PLUS_PRICE_ID,
    ].filter((id): id is string => Boolean(id));

    if (allowedPriceIds.length === 0) {
        console.error("Stripe plan price IDs are not configured.");

        return [];
    }

    const prices = await stripe.prices.list({
        active: true,
        type: "recurring",
        expand: ["data.product"],
        limit: 100,
    });

    return prices.data
        .filter((price) => allowedPriceIds.includes(price.id))
        .map(mapPriceToPlan)
        .filter((plan): plan is StripePlan => plan !== null)
        .sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0));
}

export const getStripePlans = unstable_cache(
    fetchStripePlans,
    ["stripe-plans"],
    {
        revalidate: 3600,
    },
);
