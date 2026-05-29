"use client";

import { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products = [] }: { products?: Product[] }) {
  if (products.length === 0) {
    return <div className="empty">No products found.</div>;
  }

  return (
    <div className="row g-3 g-md-4">
      {products.map(product => (
        <div className="col-6 col-lg-4 col-xl-3" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
