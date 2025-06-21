"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { toast, Toaster } from "sonner";

const ProfilePage = () => {
  const [user, setUser] = useState({ name: "", email: "", phone: "" });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(user);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Fetch user profile from backend
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("/api/users/profile");
        setUser({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
        setForm({ name: data.name || "", email: data.email || "", phone: data.phone || "" });
      } catch (error) {
        // If unauthorized, show a friendly message
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setError("You must be logged in to view your profile.");
        } else {
          setError(`Could not load profile : ${error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUser({ name: data.name, email: data.email, phone: form.phone });
      setEdit(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      setError(`Could not update profile ${err}`);
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete account");
      toast.success("Account deleted successfully");
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(`Could not delete account. Please try again : ${err}`);
      toast.error("Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center py-10 transition-colors">
        <div className="w-full max-w-md bg-[var(--card)] rounded-2xl shadow-xl border-2 border-[var(--border)] p-0 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-3xl font-bold text-center mb-2 text-[var(--card-foreground)] tracking-tight">Profile</h2>
            <div className="h-1 w-12 bg-[var(--foreground)] rounded-full mx-auto mb-6"></div>
            {loading ? (
              <div className="text-center py-8 text-[var(--secondary)]">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-[var(--card-foreground)] font-semibold">{error}</div>
            ) : !edit ? (
              <div>
                <div className="mb-6">
                  <div className="text-xs uppercase text-[var(--secondary)] tracking-wider mb-1">Name</div>
                  <div className="font-semibold text-lg text-[var(--card-foreground)]">{user.name}</div>
                </div>
                <div className="mb-6">
                  <div className="text-xs uppercase text-[var(--secondary)] tracking-wider mb-1">Email</div>
                  <div className="font-semibold text-lg text-[var(--card-foreground)]">{user.email}</div>
                </div>
                <div className="mb-8">
                  <div className="text-xs uppercase text-[var(--secondary)] tracking-wider mb-1">Phone</div>
                  <div className="font-semibold text-lg text-[var(--card-foreground)]">{user.phone || <span className='text-[var(--secondary)]'>Not set</span>}</div>
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-2 px-4 bg-[var(--foreground)] hover:bg-[var(--neutral)] text-[var(--background)] rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    onClick={() => setEdit(true)}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--card-foreground)]" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[var(--border)] rounded-lg text-[var(--card-foreground)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--card-foreground)]" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[var(--border)] rounded-lg text-[var(--card-foreground)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[var(--card-foreground)]" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-[var(--border)] rounded-lg text-[var(--card-foreground)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-[var(--foreground)] hover:bg-[var(--neutral)] text-[var(--background)] rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 px-4 bg-[var(--card)] hover:bg-[var(--neutral)] text-[var(--card-foreground)] border-2 border-[var(--border)] rounded-lg font-semibold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    onClick={() => setEdit(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {!loading && !error && (
              <div className="flex flex-col gap-2 mt-8 border-t-2 border-[var(--border)] pt-6">
                <button
                  className="w-full py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-semibold transition hover:bg-[var(--neutral)] border-2 border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
                <button
                  className="w-full py-2 px-4 bg-[var(--card)] hover:bg-[var(--neutral)] text-[var(--card-foreground)] rounded-lg font-semibold transition border-2 border-[var(--border)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;