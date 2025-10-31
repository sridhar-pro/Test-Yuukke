// app/products/offers/page.jsx
"use client";

import ProductsPage from "../page"; // reuse your main products page

export default function OffersPage(props) {
  return <ProductsPage {...props} isFestivalGifting={true} />;
}
