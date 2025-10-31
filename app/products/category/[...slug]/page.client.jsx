"use client";

import ProductsPage from "../../page";
import { useParams } from "next/navigation";

export default function CategoryPageClient(props) {
  const { slug } = useParams(); // array

  const categorySlug = slug?.[0] || null;
  const subCategorySlug = slug?.[1] || null;
  const subSubCategorySlug = slug?.[2] || null;

  return (
    <ProductsPage
      {...props}
      categorySlug={categorySlug}
      subCategorySlug={subCategorySlug}
      subSubCategorySlug={subSubCategorySlug}
    />
  );
}
