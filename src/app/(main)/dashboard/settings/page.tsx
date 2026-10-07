import { SettingsTabs } from "@/components/settings/settings-tabs";
import { getUserSubscription } from "@/lib/actions/subscription";
import { getUserMetadata } from "@/lib/actions/user";
import { getStripePlans } from "@/lib/stripe/plans";
import { redirect } from "next/navigation";

const planLabels: Record<string, string> = {
    free: "Free Tier",
    pro: "Pro",
    pro_plus: "Pro Plus",
    enterprise: "Enterprise",
};

const SettingsPage = async () => {
    const [user, subscription, plans] = await Promise.all([
        getUserMetadata(),
        getUserSubscription(),
        getStripePlans(),
    ]);

    if (!user) {
        redirect("/auth/login");
    }

    const creditsAllowed = subscription?.creditsAllowed ?? 0;
    const creditsUsed = subscription?.creditsUsed ?? 0;

    const creditsLeft = Math.max(creditsAllowed - creditsUsed, 0);

    const planType = subscription?.planType ?? "free";
    const planLabel = planLabels[planType] ?? "Free Tier";

    return (
        <main className="w-full max-w-5xl pb-12 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Settings
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage Your Profile, Subscription, And Account Preferences.
                </p>
            </div>

            {/* Settings */}
            <SettingsTabs
                user={{
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email ?? "",
                    avatarUrl: user.avatarUrl,
                }}
                planType={planType}
                planLabel={planLabel}
                creditsLeft={creditsLeft}
                creditsAllowed={creditsAllowed}
                plans={plans}
            />
        </main>
    );
};

export default SettingsPage;
