"use client";

import { PLAN_TIER_ORDER } from "@/constants";
import {
    changePlan,
    syncSubscriptionAfterCheckout,
} from "@/lib/actions/stripe";
import { StripePlan } from "@/lib/stripe/plan-types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "../ui/toast";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";

interface BillingSectionProps {
    planType: string;
    planLabel: string;
    creditsLeft: number;
    creditsAllowed: number;
    plans: StripePlan[];
}

function formatPrice(amount: number | null, currency: string) {
    if (amount === null) return "—";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(amount / 100);
}

function getPlanTier(planType: string) {
    return PLAN_TIER_ORDER[planType] ?? 0;
}

function cleanBillingQueryParams() {
    const params = new URLSearchParams(window.location.search);

    params.delete("billing");
    params.set("tab", "billing");

    window.history.replaceState(
        null,
        "",
        `/dashboard/settings?${params.toString()}`,
    );
}

export function BillingSection({
    planType,
    planLabel,
    creditsLeft,
    creditsAllowed,
    plans,
}: BillingSectionProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const billingStatus = searchParams.get("billing");

    const [pendingPriceId, setPendingPriceId] = useState<string | null>(null);

    const [confirmPlan, setConfirmPlan] = useState<StripePlan | null>(null);

    const [isManualSyncing, setIsManualSyncing] = useState(false);

    const [hasSyncedCheckout, setHasSyncedCheckout] = useState(false);

    const hasHandledBillingRef = useRef(false);

    const isSyncingAfterCheckout =
        (billingStatus === "success" && !hasSyncedCheckout) || isManualSyncing;

    const currentTier = getPlanTier(planType);

    useEffect(() => {
        if (hasHandledBillingRef.current) {
            return;
        }

        if (billingStatus === "success") {
            hasHandledBillingRef.current = true;

            void (async () => {
                const result = await syncSubscriptionAfterCheckout();

                if (result.success) {
                    toast.add({
                        title: "Subscription Activated Successfully.",
                    });

                    cleanBillingQueryParams();
                    router.refresh();
                } else {
                    toast.add({
                        title:
                            result.error ??
                            "Payment Succeeded, But Your Plan Could Not Be Synced Yet.",
                    });

                    cleanBillingQueryParams();
                }

                setHasSyncedCheckout(true);
            })();
        }

        if (billingStatus === "cancelled") {
            hasHandledBillingRef.current = true;

            toast.add({
                title: "Checkout Cancelled",
            });

            cleanBillingQueryParams();
        }
    }, [billingStatus, router]);

    const handlePlanChange = async (plan: StripePlan) => {
        try {
            setPendingPriceId(plan.priceId);

            const result = await changePlan(plan.priceId);

            if ("url" in result && result.url) {
                window.location.assign(result.url);
                return;
            }

            if ("upgraded" in result && result.upgraded) {
                setConfirmPlan(null);

                toast.add({
                    title: "Plan Upgraded Successfully.",
                });

                router.refresh();
            }
        } catch (error) {
            console.error(error);

            toast.add({
                title:
                    error instanceof Error
                        ? error.message
                        : "Failed To Change Plan.",
            });
        } finally {
            setPendingPriceId(null);
        }
    };

    const isPaidSubscriber = planType !== "free";

    if (isSyncingAfterCheckout) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating Your Subscription...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Plan */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Current Plan
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                            {planLabel}
                        </p>
                    </div>

                    <Badge variant="secondary">{planLabel}</Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                    <p className="text-muted-foreground">
                        Available Message Credits
                    </p>

                    <span className="font-mono font-bold text-foreground">
                        {creditsLeft} / {creditsAllowed}
                    </span>
                </div>
            </div>

            {/* Available Plans */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Available Plans
                    </h3>

                    <p className="mt-1 text-[11px] text-muted-foreground">
                        {isPaidSubscriber
                            ? "Upgrades Apply Instantly. Stripe Charges The Prorated Difference To Your Saved Card."
                            : "Choose A Plan To Get Started. You'll Complete Payment On Stripe Checkout."}
                    </p>
                </div>

                {plans.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border/60 py-4 text-center text-xs text-muted-foreground">
                        No Paid Plans Are Configured In Stripe Yet.
                    </p>
                ) : (
                    <div className="grid gap-3">
                        {plans.map((plan) => {
                            const isCurrent = plan.planType === planType;

                            const planTier = getPlanTier(plan.planType);

                            const canUpgrade = planTier > currentTier;

                            const isPending = pendingPriceId === plan.priceId;

                            return (
                                <div
                                    key={plan.priceId}
                                    className={cn(
                                        "space-y-3 rounded-xl border p-4 transition-colors",
                                        isCurrent
                                            ? "border-foreground/30 bg-accent/20"
                                            : "border-border/60 bg-background",
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm font-semibold text-foreground">
                                                    {plan.name}
                                                </h4>

                                                {isCurrent && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px]"
                                                    >
                                                        Current
                                                    </Badge>
                                                )}
                                            </div>

                                            {plan.description && (
                                                <p className="line-clamp-2 text-xs text-muted-foreground">
                                                    {plan.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-foreground">
                                                {formatPrice(
                                                    plan.amount,
                                                    plan.currency,
                                                )}
                                            </p>

                                            {plan.interval && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    Per {plan.interval}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-[11px] text-muted-foreground">
                                            {plan.creditsAllowed} Message
                                            Credits / Month
                                        </p>

                                        {isCurrent ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                                <Check className="h-3 w-3" />
                                                Active
                                            </span>
                                        ) : canUpgrade ? (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    setConfirmPlan(plan)
                                                }
                                                disabled={
                                                    pendingPriceId !== null
                                                }
                                                className="h-8 cursor-pointer rounded-lg px-3 text-xs"
                                            >
                                                {isPending ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-1 h-3.5 w-3.5" />
                                                        Upgrade
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground/60">
                                                —
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Manual Sync */}
            <Button
                type="button"
                variant="ghost"
                onClick={async () => {
                    setIsManualSyncing(true);

                    const result = await syncSubscriptionAfterCheckout();

                    setIsManualSyncing(false);

                    if (result.success) {
                        toast.add({
                            title: "Subscription Synced Successfully.",
                        });

                        router.refresh();
                    } else {
                        toast.add({
                            title:
                                result.error ?? "No Active Subscription Found.",
                        });
                    }
                }}
                className="h-8 w-full cursor-pointer rounded-xl text-[11px] text-muted-foreground"
            >
                Refresh Plan Status
            </Button>

            {/* Confirm Plan Dialog */}
            <AlertDialog
                open={confirmPlan !== null}
                onOpenChange={(open) => {
                    if (!open && pendingPriceId === null) {
                        setConfirmPlan(null);
                    }
                }}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {isPaidSubscriber
                                ? "Confirm Plan Upgrade"
                                : "Continue To Checkout"}
                        </AlertDialogTitle>

                        {/* 
                          IMPORTANT:
                          AlertDialogDescription renders a <p>.
                          Therefore we keep all content inline
                          and do NOT put <p> elements inside it.
                        */}
                        <div className="space-y-2 text-left text-sm text-muted-foreground">
                            {confirmPlan && (
                                <>
                                    <p>
                                        {isPaidSubscriber ? (
                                            <>
                                                Upgrade From{" "}
                                                <strong className="text-foreground">
                                                    {planLabel}
                                                </strong>{" "}
                                                To{" "}
                                                <strong className="text-foreground">
                                                    {confirmPlan.name}
                                                </strong>
                                                ?
                                            </>
                                        ) : (
                                            <>
                                                Subscribe To{" "}
                                                <strong className="text-foreground">
                                                    {confirmPlan.name}
                                                </strong>
                                                ?
                                            </>
                                        )}
                                    </p>

                                    <p className="text-xs">
                                        {formatPrice(
                                            confirmPlan.amount,
                                            confirmPlan.currency,
                                        )}
                                        {confirmPlan.interval
                                            ? ` / ${confirmPlan.interval}`
                                            : ""}
                                        {" · "}
                                        {confirmPlan.creditsAllowed} Message
                                        Credits / Month
                                    </p>

                                    <p className="text-xs">
                                        {isPaidSubscriber
                                            ? "No Checkout Page. Stripe Will Charge The Prorated Difference To Your Saved Payment Method Right Away."
                                            : "You'll Be Redirected To Stripe To Enter Your Payment Details."}
                                    </p>
                                </>
                            )}
                        </div>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={pendingPriceId !== null}
                            className="cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>

                        <Button
                            disabled={
                                pendingPriceId !== null || confirmPlan === null
                            }
                            className="cursor-pointer"
                            onClick={() => {
                                if (confirmPlan) {
                                    void handlePlanChange(confirmPlan);
                                }
                            }}
                        >
                            {pendingPriceId !== null ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Processing...
                                </>
                            ) : isPaidSubscriber ? (
                                "Confirm Upgrade"
                            ) : (
                                "Continue To Stripe"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
