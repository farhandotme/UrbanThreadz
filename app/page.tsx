"use client";
import Slider from "@/components/Slider";
import { ProductsGrid } from "@/components/ui/Cards";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  const collections = "collections";
  const newArrivals = "new arrivals";
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16 mt-8">
        <section className="mb-12">
          <Slider />
        </section>
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-1.5 h-8 bg-[var(--foreground)] rounded-full mr-2" />
              <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                {newArrivals.charAt(0).toUpperCase() + newArrivals.slice(1)}
              </h1>
            </div>
            <Link href="/sale" className="px-5 py-2 border border-[var(--border)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-sm">
              View All
            </Link>
          </div>
          <ProductsGrid heading={newArrivals} />
          <div className="flex items-center justify-between mt-16 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-block w-1.5 h-8 bg-[var(--foreground)] rounded-full mr-2" />
              <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                {collections.charAt(0).toUpperCase() + collections.slice(1)}
              </h1>
            </div>
          </div>
          <ProductsGrid heading={collections} />
        </section>
      </main>
      <Footer />
    </>
  );
}
