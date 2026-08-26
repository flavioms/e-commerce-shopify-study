"use client";

import { ProductSearch } from "@/components/organisms/product-search";

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Search
      </h1>

      <ProductSearch autoFocus />
    </div>
  );
}
