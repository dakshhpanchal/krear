import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MonoLabel, InkButton } from "@/components/krear/primitives";
import { PageHeader, RequireAuth, WorkspacePage } from "@/components/krear/workspace";
import { useProfile, useUpdateProfile } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile | Krear" },
      {
        name: "description",
        content: "Manage your professional profile details, contact information, and social links.",
      },
      { property: "og:title", content: "Profile | Krear" },
      {
        property: "og:description",
        content: "Manage your professional profile details, contact information, and social links.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<Omit<Profile, "id">>({
    full_name: "",
    phone: "",
    email: "",
    linkedin_url: "",
    github_url: "",
    location: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
        location: profile.location || "",
      });
    }
  }, [profile]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to update profile");
      },
    });
  }

  if (isLoading) {
    return (
      <WorkspacePage>
        <PageHeader
          eyebrow="Identity"
          title="Personal Profile"
          description="Manage your professional profile details, contact information, and social links."
        />
        <div className="mt-8 h-80 animate-pulse rounded-3xl bg-muted" />
      </WorkspacePage>
    );
  }

  if (error) {
    return (
      <WorkspacePage>
        <PageHeader
          eyebrow="Identity"
          title="Personal Profile"
          description="Manage your professional profile details, contact information, and social links."
        />
        <p className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 font-mono text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load profile details."}
        </p>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage>
      <PageHeader
        eyebrow="Identity"
        title="Personal Profile"
        description="Manage your professional profile details, contact information, and social links."
      />

      <form onSubmit={submit} className="paper-card mt-8 grid gap-6 p-8 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <MonoLabel>Full Name</MonoLabel>
          <input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. Jane Doe"
          />
        </label>

        <label className="flex flex-col gap-2">
          <MonoLabel>Location</MonoLabel>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. San Francisco, CA"
          />
        </label>

        <label className="flex flex-col gap-2">
          <MonoLabel>Email Address</MonoLabel>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. jane.doe@example.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <MonoLabel>Phone Number</MonoLabel>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. +1 (555) 019-2834"
          />
        </label>

        <label className="flex flex-col gap-2">
          <MonoLabel>LinkedIn URL</MonoLabel>
          <input
            type="url"
            value={form.linkedin_url}
            onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. https://linkedin.com/in/janedoe"
          />
        </label>

        <label className="flex flex-col gap-2">
          <MonoLabel>GitHub URL</MonoLabel>
          <input
            type="url"
            value={form.github_url}
            onChange={(e) => setForm({ ...form, github_url: e.target.value })}
            className="rounded-2xl border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. https://github.com/janedoe"
          />
        </label>

        <div className="md:col-span-2 mt-4">
          <InkButton type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </InkButton>
        </div>
      </form>
    </WorkspacePage>
  );
}
