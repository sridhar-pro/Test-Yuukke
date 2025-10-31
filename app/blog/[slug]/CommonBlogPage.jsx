"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { useAuth } from "@/app/utils/AuthContext";

export default function CommonBlogPage({ slug }) {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const { getValidToken } = useAuth();

  const leftRef = useRef(null); // main article scroll container
  const sidebarRef = useRef(null); // right sidebar

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  useEffect(() => {
    async function fetchBlog() {
      try {
        const token = await getValidToken();

        // Single blog details by slug
        const res = await fetch(`/api/getBlogsDetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ slug }),
        });
        const result = await res.json();

        if (result.status) {
          setBlog(result.data);
        }

        // Fetch related blogs
        const relatedRes = await fetch(`/api/getBlogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ page: 1, limit: 5 }),
        });
        const relatedData = await relatedRes.json();

        if (relatedData.status) {
          setRelatedBlogs(
            relatedData.data.filter((b) => b.slug !== slug) // exclude current blog
          );
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
      }
    }

    if (slug) fetchBlog();
  }, [slug, getValidToken]);

  // Forward wheel events on sidebar -> left scroll
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const left = leftRef.current;
    if (!sidebar || !left) return;

    const onWheel = (e) => {
      // deltaY > 0 => scroll down, < 0 => scroll up
      const delta = e.deltaY;
      const canScrollDown =
        left.scrollTop + left.clientHeight < left.scrollHeight - 1;
      const canScrollUp = left.scrollTop > 0;

      // If left can scroll in the wheel direction, scroll it and prevent default
      if ((delta > 0 && canScrollDown) || (delta < 0 && canScrollUp)) {
        left.scrollBy({ top: delta, behavior: "auto" });
        e.preventDefault(); // stop sidebar/page from scrolling
      }
      // Otherwise allow the event to bubble so the page can scroll.
    };

    // use passive:false so we can call preventDefault
    sidebar.addEventListener("wheel", onWheel, { passive: false });
    return () => sidebar.removeEventListener("wheel", onWheel);
  }, [blog, relatedBlogs]);

  if (!blog) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <section className="py-12 font-odop max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left - scrollable article */}
      <article
        ref={leftRef}
        className="lg:col-span-2 lg:pr-8 overflow-y-auto"
        // adjust the 6rem (96px) if your header/sticky top is different
        style={{ maxHeight: "calc(100vh - 6rem)" }}
      >
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#7d0431]"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#7d0431]">
            Blog
          </Link>
          <span>/</span>
          <span className="font-semibold">{blog.title}</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {blog.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8">{blog.description}</p>

        {/* Cover Image */}
        <div className="my-10">
          <Image
            src={getImageSrc(blog.image)}
            alt={blog.title}
            width={900}
            height={500}
            className="rounded-xl shadow-lg object-cover w-full max-h-[550px]"
          />
        </div>

        <p className="text-lg text-gray-600 mb-8">{blog.description}</p>

        {/* Body */}
        <div
          className="prose prose-xl prose-gray max-w-none
            prose-headings:font-semibold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-img:rounded-lg prose-img:mx-auto prose-img:my-6
            prose-a:text-[#7d0431] prose-a:no-underline hover:prose-a:underline
            prose-li:marker:text-[#7d0431]
            prose-strong:text-gray-900
            prose-blockquote:border-l-4 prose-blockquote:border-[#7d0431] prose-blockquote:pl-4 prose-blockquote:text-gray-700"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </article>

      {/* Right - sticky sidebar */}
      <aside
        ref={sidebarRef}
        className="lg:col-span-1 sticky top-0 h-screen overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
            Related Blogs
          </h2>
          <div className="flex flex-col gap-5">
            {relatedBlogs.length > 0 ? (
              relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="flex gap-4 items-start group"
                >
                  <Image
                    src={getImageSrc(rel.image)}
                    alt={rel.title}
                    width={110}
                    height={80}
                    className="rounded-md object-cover flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-base font-medium text-gray-800 group-hover:text-[#7d0431]">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {rel.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500">No related blogs found.</p>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}
