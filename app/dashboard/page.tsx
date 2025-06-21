"use client";

import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Toaster />
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center py-10 transition-colors">
        <div className="w-full max-w-3xl bg-[var(--card)] rounded-2xl shadow-xl border-2 border-[var(--border)] p-0 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-3xl font-bold text-center mb-2 text-[var(--card-foreground)] tracking-tight">Dashboard</h2>
            <div className="h-1 w-12 bg-[var(--foreground)] rounded-full mx-auto mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Overview Card */}
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">Overview</h3>
                <p className="text-[var(--secondary)] text-sm text-center">Welcome to your dashboard! Here you can view your recent activity, orders, and account stats.</p>
              </div>
              {/* Account Stats Card */}
              <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">Account Stats</h3>
                <ul className="text-[var(--secondary)] text-sm space-y-1">
                  <li>Orders: <span className="font-bold text-[var(--card-foreground)]">0</span></li>
                  <li>Wishlist: <span className="font-bold text-[var(--card-foreground)]">0</span></li>
                  <li>Member since: <span className="font-bold text-[var(--card-foreground)]">2024</span></li>
                </ul>
              </div>
            </div>
            {/* Recent Orders Section */}
            <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-[var(--card-foreground)] mb-2">Recent Orders</h3>
              <div className="text-[var(--secondary)] text-sm">You have no recent orders.</div>
              <Link href="/orders" className="inline-block mt-3 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-lg font-semibold transition hover:bg-[var(--neutral)]">View All Orders</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
