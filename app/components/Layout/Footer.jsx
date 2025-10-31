"use client";
import { useEffect, useState, useRef } from "react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { useAuth } from "@/app/utils/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MailCheck } from "lucide-react";
import { fetchWithAuthGlobal } from "@/app/utils/fetchWithAuth";

export default function Footer() {
  const pathname = usePathname();
  const { getValidToken, isAuthReady } = useAuth();
  const [apiCategories, setApiCategories] = useState([]);

  const staticSection = {
    title: "Quick Links",
    links: [
      {
        name: "Blog",
        slug: "/blog",
      },
      {
        name: "ODOP Registration",
        slug: "/odop-registration",
      },
      {
        name: "Seller Registration",
        slug: "/seller-registration",
      },
      {
        name: "Empowering Community",
        slug: "https://marketplace.yuukke.com/empowering-community",
      },
      {
        name: "How To Gain YuukkeMints",
        slug: "https://marketplace.yuukke.com/gain-yuukkemints",
      },
    ],
  };

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribed(true);
    // here you can also trigger your API call
  };

  // 🔥 Auto-clear after 10 seconds
  useEffect(() => {
    if (subscribed) {
      const timer = setTimeout(() => {
        setSubscribed(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer); // cleanup
    }
  }, [subscribed]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/homeCategory");

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return;
        }

        const data = await res.json();
        if (!data) return;

        const formattedData = data
          .map((category) => {
            const validSubcategories = (category.subcategories || [])
              .filter((sub) => sub?.name && sub?.slug)
              .map((sub) => ({
                name: sub.name,
                slug: sub.slug,
                parentSlug: category.slug,
              }));

            return {
              title: category.name,
              parentSlug: category.slug,
              links: validSubcategories,
            };
          })
          .filter((category) => category.links.length > 0);

        setApiCategories(formattedData);
      } catch (error) {
        console.error("❌ Error processing categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const footerData = [staticSection, ...apiCategories];
  // console.log("Complete footer data:", footerData);

  return (
    <footer className="bg-white text-sm text-[#911439]">
      {/* Subscribe Section */}
      {pathname === "/" && (
        <div className="w-full py-6 bg-white p-4">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-10 px-4 max-w-[105rem] mx-auto">
            {/* Left side */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-40 ml-0 md:ml-6 text-center md:text-left">
              <Image
                src="/subscribe.webp"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain mx-auto md:mx-0"
              />
              <p className="text-[#911439] font-semibold text-2xl md:text-[2rem]">
                Get offers in your inbox
              </p>
            </div>

            {/* Right side */}
            <div className="flex flex-col w-full md:w-auto mt-4 md:mt-0">
              <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-start md:items-center">
                <div className="p-[1px] rounded bg-gradient-to-r from-red-700 to-red-800 w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                  <input
                    type="email"
                    placeholder="Enter your mail here"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded outline-none bg-white text-black text-sm sm:text-base"
                  />
                </div>

                <button
                  onClick={handleSubscribe}
                  className="bg-gradient-to-r from-blue-950 to-red-900 text-white px-4 py-2 rounded-sm hover:from-blue-800 hover:to-blue-950 transition w-full md:w-56"
                >
                  Subscribe Me!
                </button>
              </div>

              {subscribed && (
                <p className="flex items-center gap-2 text-green-600 font-semibold text-sm mt-2">
                  <MailCheck className="w-4 h-4" />
                  Subscribed as {email}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Links Section */}
      <div className="w-full px-4">
        <div className="w-full mx-auto px-0 md:px-6 py-6">
          {footerData.map((section, index) => (
            <div
              key={`section-${index}`}
              className={
                section.title === "Quick Links"
                  ? "border-y border-gray-300 w-full py-6"
                  : "py-2"
              }
            >
              <div className="text-xs">
                {section.title === "Quick Links" ? (
                  <h4 className="font-bold underline">
                    {section.title
                      .replace(/&#039;/g, "'")
                      .replace(/&amp;/g, "&")}
                  </h4>
                ) : (
                  <Link
                    href={`/products/category/${section.parentSlug}`}
                    aria-label={`Explore ${section.parentName} category`}
                    className="font-bold underline hover:text-[#6e0e2d]"
                  >
                    {section.title
                      .replace(/&#039;/g, "'")
                      .replace(/&amp;/g, "&")}
                  </Link>
                )}

                <div className="flex flex-wrap gap-2 text-[#911439]">
                  {section.links.map((link, idx) => (
                    <span key={`link-${index}-${idx}`}>
                      {idx > 0 && <span className="mx-0 md:mx-1">|</span>}

                      {section.title === "Quick Links" ? (
                        // Direct link for Quick Links
                        <a
                          href={link.slug}
                          target={
                            link.slug.startsWith("http") ? "_blank" : "_self"
                          }
                          rel={
                            link.slug.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className="hover:underline"
                        >
                          {link.name
                            .replace(/&#039;/g, "'")
                            .replace(/&amp;/g, "&")}
                        </a>
                      ) : (
                        // Keep normal behavior for other sections
                        <Link
                          href={`/products/category/${section.parentSlug}/${link.slug}`}
                          aria-label={`Explore ${link.name} category`}
                          className="hover:underline"
                        >
                          {link.name
                            .replace(/&#039;/g, "'")
                            .replace(/&amp;/g, "&")}
                        </Link>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-300 mt-0 pt-0">
        <div className="max-w-[105rem] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Logo on the far left (or center on mobile) */}
            <div className="md:w-1/4 w-full flex justify-center md:justify-start">
              <Image
                src="/logo.png"
                alt="Logo"
                width={160} // w-40 = 160px
                height={64} // h-16 = 64px (you can use md height conditionally in layout)
                className="object-contain"
              />
            </div>

            {/* Text & Payment icons */}
            <div className="md:w-3/4 w-full flex flex-col items-center md:items-end text-center md:text-left text-gray-700 text-xs md:text-base font-medium">
              <p className="max-w-7xl">
                Your one-stop destination for an unparalleled shopping
                experience. We pride ourselves on offering a diverse and
                carefully curated selection of high-quality products across
                various categories. From fashion and accessories to home
                essentials and beyond, Yuukke is committed to bringing you items
                that enrich your life while prioritizing sustainability.
              </p>

              {/* Payment Icons below */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-end gap-2">
                <Image
                  src="/mastercard.webp"
                  alt="Mastercard"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <Image
                  src="/maestro.webp"
                  alt="Maestro"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <Image
                  src="/american_express.webp"
                  alt="Amex"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <Image
                  src="/paypal.webp"
                  alt="PayPal"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <Image
                  src="/visa.webp"
                  alt="Visa"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div
        className="bg-gradient-to-r from-blue-950 to-[#911439] text-white text-sm px-4 sm:px-8 md:px-16 lg:px-20 py-6"
        translate="no"
      >
        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center md:justify-between text-center md:text-left">
          {/* Copyright */}
          <div className="text-xs sm:text-sm">
            ©2025 Yuukke Global Ventures Private Limited.
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
            <a
              href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
              className="hover:underline"
            >
              Privacy
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://marketplace.yuukke.com/page/shipping"
              className="hover:underline"
            >
              Shipping
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Returns.pdf"
              className="hover:underline"
            >
              Returns & Refund
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/yuukke_tnc.pdf"
              className="hover:underline"
            >
              T&C
            </a>
            <span className="hidden sm:inline">|</span>
            <a
              href="https://yuukke.com/contact-us/"
              className="hover:underline"
            >
              Contact
            </a>
          </div>

          {/* Socials */}
          <div className="flex justify-center md:justify-end items-center gap-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Follow us</span>

            <a
              href="https://www.instagram.com/yuukkeglobal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Yuukke Instagram Page"
            >
              <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-300 cursor-pointer" />
            </a>

            <a
              href="https://www.linkedin.com/company/yuukkeglobal/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Yuukke LinkedIn Page"
            >
              <FaLinkedinIn className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-300 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
