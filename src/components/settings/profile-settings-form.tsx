"use client";

import {
    ALLOWED_AVATAR_TYPES,
    AVATAR_BUCKET,
    MAX_AVATAR_SIZE_BYTES,
} from "@/constants";
import { createZodResolver } from "@/lib/resolvers";
import { ProfileFormValues, profileSchema } from "@/lib/validation/profile";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "../ui/toast";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/user";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Link from "next/link";
import { Button } from "../ui/button";

interface ProfileSettingsFormProps {
    userId: string;
    initialFullName: string;
    initialEmail: string;
    initialAvatarUrl: string;
}

function getInitials(name: string) {
    return name.trim().slice(0, 2).toUpperCase() || "U";
}

export function ProfileSettingsForm({
    userId,
    initialFullName,
    initialEmail,
    initialAvatarUrl,
}: ProfileSettingsFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [avatarPreview, setAvatarPreview] = useState(initialAvatarUrl);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isDirty },
    } = useForm<ProfileFormValues>({
        resolver: createZodResolver(profileSchema),
        defaultValues: {
            fullName: initialFullName,
        },
    });

    const fullName = watch("fullName");

    const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (
            !ALLOWED_AVATAR_TYPES.includes(
                file.type as (typeof ALLOWED_AVATAR_TYPES)[number],
            )
        ) {
            toast.add({
                title: "Please Upload a JPG, PNG, or WebP Image.",
            });
            event.target.value = "";
            return;
        }

        if (file.size > MAX_AVATAR_SIZE_BYTES) {
            toast.add({
                title: "Image Must Be 2MB Or Smaller",
            });
            event.target.value = "";
            return;
        }

        setSelectedFile(file);

        setAvatarPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            setIsSaving(true);

            let avatarUrl = initialAvatarUrl;

            if (selectedFile) {
                const extension =
                    selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";
                const filePath = `${userId}/avatar.${extension}`;
                const supabase = createClient();

                const { error: uploadError } = await supabase.storage
                    .from(AVATAR_BUCKET)
                    .upload(filePath, selectedFile, {
                        upsert: true,
                        contentType: selectedFile.type,
                    });

                if (uploadError) {
                    toast.add({
                        title: "Failed To Upload Avatar",
                        description: uploadError.message,
                    });
                    return;
                }

                const { data } = supabase.storage
                    .from(AVATAR_BUCKET)
                    .getPublicUrl(filePath);

                avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
            }

            const hasProfileChanges =
                isDirty ||
                (selectedFile !== null && avatarUrl !== initialAvatarUrl);

            if (!hasProfileChanges) {
                toast.add({
                    title: "No Changes To Save.",
                });
                return;
            }

            const result = await updateProfile({
                fullName: values.fullName,
                avatarUrl,
            });

            if (!result.success) {
                toast.add({
                    title: result.error ?? "Failed To Update Profile.",
                });
                return;
            }

            setSelectedFile(null);
            setAvatarPreview(avatarUrl);
            toast.add({
                title: "Profile Updated Successfully.",
            });
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.add({
                title: "Something Went Wrong While Saving Your Profile.",
            });
        } finally {
            setIsSaving(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Avatar className="size-16">
                        <AvatarImage src={avatarPreview} alt={fullName} />
                        <AvatarFallback className="text-sm">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSaving}
                        className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
                        aria-label="Change profile photo"
                    >
                        <Camera className="size-3.5" />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ALLOWED_AVATAR_TYPES.join(",")}
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">
                        Profile photo
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        JPG, PNG, or WebP. Max 2MB.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1.5">
                    <Label
                        htmlFor="fullName"
                        className="text-muted-foreground font-medium"
                    >
                        Full Name
                    </Label>
                    <Input
                        id="fullName"
                        type="text"
                        disabled={isSaving}
                        className="h-10 rounded-xl border-border text-xs"
                        {...register("fullName")}
                    />
                    {errors.fullName && (
                        <p className="text-[11px] text-destructive">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>
                <div className="space-y-1.5">
                    <Label
                        htmlFor="email"
                        className="text-muted-foreground font-medium"
                    >
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={initialEmail}
                        readOnly
                        className="h-10 rounded-xl border-border bg-muted/30 text-xs"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
                <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                >
                    Change Password
                </Link>
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-9 rounded-xl text-xs font-medium px-4"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </form>
    );
}
