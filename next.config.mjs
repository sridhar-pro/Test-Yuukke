/** @type {import('next').NextConfig} */

// 🟢 Toggle this to `true` when testing!
const IS_TEST = false;

// 🔗 API endpoints
const TEST_API = "https://marketplace.betalearnings.com/api/v1/Marketv2";
const LIVE_API = "https://marketplace.yuukke.com/api/v1/Marketv2";

// 🧠 Use BASE_API for general rewrites (based on toggle)
const BASE_API = IS_TEST ? TEST_API : LIVE_API;

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizeCss: true, // speeds up CSS extraction
  },
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "marketplace.betalearnings.com" },
      { protocol: "https", hostname: "marketplace.yuukke.com" },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/giftBox",
        destination: `${BASE_API}/giftBox`,
      },
      {
        source: "/api/addGiftCard",
        destination: `${BASE_API}/addGiftCard`,
      },
      {
        source: "/api/addGiftAddons",
        destination: `${BASE_API}/giftAddons`,
      },
      {
        source: "/api/homeCategory",
        destination: `${BASE_API}/homeCategory`,
      },
      {
        source: "/api/quantityCheck",
        destination: `${BASE_API}/getProductDetails/`,
      },
      {
        source: "/api/slider",
        destination: `${BASE_API}/slider`,
      },
      {
        source: "/api/mobslider",
        destination: `${BASE_API}/mobile_slider`,
      },
      {
        source: "/api/newarrival",
        destination: `${BASE_API}/newArraivals`,
      },
      {
        source: "/api/featuredproducts",
        destination: `${BASE_API}/featuredProducts`,
      },
      {
        source: "/api/festivalproducts",
        destination: `${BASE_API}/festivalProducts`,
      },
      {
        source: "/api/wellnessproducts",
        destination: `${BASE_API}/wellnessProducts`,
      },
      {
        source: "/api/giftproducts",
        destination: `${BASE_API}/getGiftsProducts`,
      },
      {
        source: "/api/corporategiftproducts",
        destination: `${BASE_API}/getCorporateGifts`,
      },
      {
        source: "/api/returngiftproducts",
        destination: `${BASE_API}/getReturnGifts`,
      },
      {
        source: "/api/vendorlogo",
        destination: `${BASE_API}/vendorLogo`,
      },
      {
        source: "/api/getNews",
        destination: `${BASE_API}/getNews`,
      },
      {
        source: "/api/getProducts",
        destination: `${BASE_API}/getProducts`,
      },
      {
        source: "/api/addcart",
        destination: `${BASE_API}/addTOCart`,
      },
      {
        source: "/api/getTax",
        destination: `${BASE_API}/calculateTax`,
      },
      {
        source: "/api/shipping",
        destination: `${BASE_API}/updateshipping`,
      },

      {
        source: "/api/createOrder",
        destination: `${BASE_API}/orderCreatedNext`,
      },
      {
        source: "/api/verifyRazor",
        destination: `${BASE_API}/verifyRazor`,
      },
      {
        source: "/api/paymentNotify",
        destination: `${BASE_API}/paymentNotify`,
      },
      {
        source: "/api/cartRemove",
        destination: `${BASE_API}/cartRemove`,
      },
      {
        source: "/api/applyCoupon",
        destination: `${BASE_API}/applyCoupon`,
      },
      {
        source: "/api/orderTracking",
        destination: `${BASE_API}/orderTracking`,
      },
      {
        source: "/api/register",
        destination: `${BASE_API}/register`,
      },
      {
        source: "/api/mobile_login",
        destination: `${BASE_API}/mobile_login`,
      },
      {
        source: "/api/verify_otp",
        destination: `${BASE_API}/verify_otp`,
      },
      {
        source: "/api/resend_otp",
        destination: `${BASE_API}/resend_otp`,
      },
      {
        source: "/api/email_login",
        destination: `${BASE_API}/email_login`,
      },
      {
        source: "/api/forget_password",
        destination: `${BASE_API}/forgot_password`,
      },
      {
        source: "/api/customer_orders",
        destination: `${BASE_API}/customer_orders`,
      },
      {
        source: "/api/customer_address",
        destination: `${BASE_API}/customer_address`,
      },
      {
        source: "/api/edit_address",
        destination: `${BASE_API}/add_and_edit_address`,
      },
      {
        source: "/api/delete_address",
        destination: `${BASE_API}/delete_address`,
      },
      {
        source: "/api/viewdetails",
        destination: `${BASE_API}/viewdetails`,
      },
      {
        source: "/api/wishlist",
        destination: `${BASE_API}/wishlist`,
      },
      {
        source: "/api/add_wishlist",
        destination: `${BASE_API}/add_wishlist`,
      },
      {
        source: "/api/remove_wishlist",
        destination: `${BASE_API}/remove_wishlist`,
      },
      {
        source: "/api/getBlogs",
        destination: `${BASE_API}/getBlogs`,
      },
      {
        source: "/api/getBlogsDetails",
        destination: `${BASE_API}/getBlogsDetails`,
      },
      {
        source: "/api/spin_wheel",
        destination: `${BASE_API}/spin_wheel`,
      },
      {
        source: "/api/bogo",
        destination: `${BASE_API}/applyBogoOffer`,
      },
      {
        source: "/api/flashsale",
        destination: `${BASE_API}/flash_sales`,
      },
      {
        source: "/api/addenquiry",
        destination: `${BASE_API}/addenquiry`,
      },
      {
        source: "/api/enquiry",
        destination: `${BASE_API}/enquiries`,
      },
      {
        source: "/api/enquirydetails",
        destination: `${BASE_API}/enquiryDetails`,
      },
      {
        source: "/api/triggerotp-seller",
        destination: `${BASE_API}/seller_triggerotp`,
      },
      {
        source: "/api/verifyotp-seller",
        destination: `${BASE_API}/seller_verifyotp`,
      },

      {
        source: "/api/seller-registration",
        destination: `${BASE_API}/seller_registration`,
      },
      {
        source: "/api/update_paymentseller",
        destination: `${BASE_API}/update_paymentseller`,
      },
      {
        source: "/api/delete_paymentseller",
        destination: `${BASE_API}/delete_paymentseller`,
      },

      {
        source: "/api/save_prebook_gift",
        destination: `${BASE_API}/save_prebook_gifts`,
        // destination: `https://marketplace.betalearnings.com/api/v1/Marketv2/save_prebook_gifts`,
      },
      {
        source: "/api/prebook_gifts_payment",
        destination: `${BASE_API}/prebook_gifts_payment`,
        // destination: `https://marketplace.betalearnings.com/api/v1/Marketv2/prebook_gifts_payment`,
      },

      // 🔐 These remain constant — always live
      {
        source: "/api/login",
        destination: "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      },
      {
        source: "/api/pincode",
        destination:
          "https://marketplace.yuukke.com/api/v1/Marketv2/uservalidatepincode",
      },
      {
        source: "/api/odopregister",
        destination:
          "https://marketplace.yuukke.com/api/v1/Marketv2/odopRegister",
      },
    ];
  },
};

export default nextConfig;
