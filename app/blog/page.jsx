"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ColourfulText } from "../components/ui/colourful-text";
import { Home } from "lucide-react";
import { useAuth } from "../utils/AuthContext";

// Blog Card Component
const BlogCard = ({ img, title, subtitle, tags, slug, link }) => {
  // Decide where to go
  const href = link && link.trim() !== "" ? link : `/blog/${slug}`;

  return (
    <Link
      href={href}
      className="bg-white h-full border border-gray-200 flex flex-col p-6 space-y-4 rounded-xl shadow-md hover:shadow-lg transition duration-300"
    >
      {/* Cover Image */}
      <Image
        alt={title}
        className="w-full aspect-video object-cover rounded-lg"
        src={img}
        width={1263}
        height={1291}
      />

      {/* Blog Content */}
      <div className="flex flex-col space-y-3">
        <h1 className="text-gray-900 font-semibold text-xl md:text-2xl">
          {title}
        </h1>
        <p className="text-gray-600 text-sm line-clamp-2">{subtitle}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-xs rounded-full font-medium ${
                  tag.color_class || "bg-[#7d0431]/10 text-[#7d0431]"
                }`}
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

// Blog Section Component
export default function BlogSection() {
  const { getValidToken } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";

    if (image.startsWith("http") || image.startsWith("/")) return image;

    const originalUrl = `https://marketplace.yuukke.com/assets/uploads/${image}`;
    return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  };

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const token = await getValidToken();
        const res = await fetch("/api/getBlogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ page: 1, limit: 6 }), // 🔹 Adjust limit as needed
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        // console.log("blog data", data);
        setBlogs(data?.data || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <section className="py-10 font-odop bg-gradient-to-br from-gray-50 to-red-50">
      {/* Hero */}
      <div className="relative z-10 mx-auto lg:max-w-7xl px-6 md:px-12 lg:px-20 text-center">
        <div className="text-sm text-gray-500 mb-4 flex items-center justify-center space-x-2">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#7d0431]"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold">Blog</span>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-6 leading-tight text-gray-900">
          Insights, Ideas & <br className="block md:hidden" />
          <span className="bg-gradient-to-r from-blue-800 to-[#a00300] bg-clip-text text-transparent">
            <ColourfulText text="Innovation" />
          </span>
        </h1>

        <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Explore expert articles, gifting tips, and lifestyle trends that
          inspire connections and elevate your celebrations.
        </p>
      </div>

      {/* Blogs */}
      <div className="max-w-7xl mx-auto px-5 sm:px-10 md:px-12 lg:px-5 space-y-14 mt-10">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start text-center md:text-left md:justify-between">
          <div className="space-y-6 max-w-2xl mx-auto md:mx-0 md:text-left">
            <span className="pl-5 relative before:absolute before:w-4 before:h-0.5 before:rounded-md before:left-0 before:top-1/2 before:bg-[#7d0431] text-[#7d0431]">
              Our Latest Insights
            </span>
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl xl:text-5xl leading-tight">
              From Our Latest Blog Posts
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center space-x-2 py-10">
            <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
            <span className="w-3 h-3 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {blogs.map((blog) => (
              <BlogCard
                key={blog.id}
                title={blog.title}
                subtitle={blog.description}
                img={getImageSrc(blog.image)} // 🔹 Adjust image path
                // slug={blog.link || `${blog.id}`}
                slug={blog.slug}
                link={blog.link}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No blogs found.</p>
        )}
      </div>
    </section>
  );
}
