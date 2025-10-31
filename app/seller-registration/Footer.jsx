import React from "react";
import { Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#000940] text-white font-odop ">
      {/* Top Section */}
      <div className="w-full px-12 py-10">
        {/* Payment Methods */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-4">
            Accepting Payment Methods
          </h3>
          <div className="flex items-center gap-4 flex-wrap">
            <img src="/upi.svg" alt="UPI" className="h-10 object-contain" />
            <img src="/visa.svg" alt="Visa" className="h-10 object-contain" />
            <img
              src="/master.svg"
              alt="Mastercard"
              className="h-10 object-contain"
            />
            <img
              src="/american_express.png"
              alt="American Express"
              className="h-[50px] object-contain"
            />
          </div>
        </div>

        {/* Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Become A Seller
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/become-a-mentor/"
                  className="hover:underline"
                >
                  Become A Mentor
                </a>
              </li>
              <li>
                <a
                  href="https://login.yuukke.com/auth/realms/yuukke/protocol/openid-connect/registrations?client_id=iwnFrontend&response_type=code&scope=openid%20email&redirect_uri=https://connect.yuukke.com/&kc_locale=en"
                  className="hover:underline"
                >
                  Become A Member
                </a>
              </li>
              <li>
                <a
                  href="https://connect.yuukke.com/yuukke-service"
                  className="hover:underline"
                >
                  Become A Service Provider
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/join-entrepreneurs-community/"
                  className="hover:underline"
                >
                  Join Us
                </a>
              </li>
              <li>
                <a href="https://yuukke.com/blog/" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/women-leaders-2023/"
                  className="hover:underline"
                >
                  Women Leaders 2023
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/#events"
                  className="hover:underline"
                >
                  Events
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://yuukke.com/#why-yuukke"
                  className="hover:underline"
                >
                  Why Yuukke
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/#get-involved"
                  className="hover:underline"
                >
                  Get Involved
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/#what-we-do"
                  className="hover:underline"
                >
                  What We Do
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/meet-greet/"
                  className="hover:underline"
                >
                  Meet & Greet
                </a>
              </li>
            </ul>
          </div>

          {/* Yuukke */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Yuukke</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://yuukke.com/about/" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/global-ambassadors/"
                  className="hover:underline"
                >
                  Global Ambassadors
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
                  className="hover:underline"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/yuukke_tnc.pdf"
                  className="hover:underline"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="https://yuukke.com/contact-us/"
                  className="hover:underline"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Address */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Yuukke Global Venture Pvt. Ltd.
            </h4>
            <p className="text-sm leading-relaxed">
              Y-213, 2nd Ave, Y Block, Anna Nagar,
              <br />
              Chennai, Tamil Nadu 600040
              <br />
              <a href="mailto:support@yuukke.com" className="underline">
                support@yuukke.com
              </a>
              <br />
              +91 04446314646
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black text-gray-300 text-sm py-4 px-12 flex flex-col md:flex-row items-center justify-between">
        <p>© 2022-26 Yuukke Global Ventures Private Limited.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a
            href="https://www.instagram.com/yuukkeglobal/"
            className="hover:text-white"
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://www.linkedin.com/company/yuukkeglobal/posts/?feedView=all"
            className="hover:text-white"
          >
            <Linkedin size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
