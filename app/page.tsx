"use client";
import Slider from "@/components/Slider";
import { ProductsGrid } from "@/components/ui/Cards";
import Navbar from "@/components/Navbar";
import Footer from "@/components/ui/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-4 py-8 md:px-8 lg:px-16 mt-8">
        <section className="mb-12">
          <Slider />
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Collections</h1>
            <button className="text-blue-600 hover:text-blue-800">View All</button>
          </div>

          <ProductsGrid />
        </section>
      </main>
      <Footer />
    </>
  );
}
