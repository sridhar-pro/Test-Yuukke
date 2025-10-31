"use client";
import { useParams } from "next/navigation";
import GiftPage from "./GiftPage"; // extracted your current big design
import CommonBlogPage from "./CommonBlogPage"; // new reusable layout

export default function BlogSlugPage() {
  const { slug } = useParams();

  // Special design only for "gift"
  if (slug === "corporate-gifting") {
    return <GiftPage />;
  }

  // Fallback for all other blogs
  return <CommonBlogPage slug={slug} />;
}
