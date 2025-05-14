"use client";
import Slider from "@/components/Slider";
import Cards from "@/components/ui/Cards";
import Navbar from "@/components/Navbar";

const FEATURED_PRODUCTS = [
  {
    name: "Product 1",
    image: "/offer_banner_new_model_1_7dd2defe-6398-430e-9e25-5d0f26f71776.webp",
    price: 100
  },
  {
    name: "Product 2",
    image: "/offer_banner_new_model_1_7dd2defe-6398-430e-9e25-5d0f26f71776.webp",
    price: 150
  },
  {
    name: "Product 3",
    image: "/offer_banner_new_model_1_7dd2defe-6398-430e-9e25-5d0f26f71776.webp",
    price: 200
  }
];

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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FEATURED_PRODUCTS.map((product, index) => (
              <Cards key={index} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}