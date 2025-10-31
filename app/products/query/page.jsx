// app/products/query/page.jsx
"use client";

import ProductsPage from "../page"; // reuse your main products page

export default function QueryPage(props) {
  return <ProductsPage {...props} isQuery={true} />;
}
