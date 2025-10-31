"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import { ArrowLeft, Send, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../utils/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useSession } from "../context/SessionContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // get previous page
  const { handleLogin, handleLogout } = useSession();
  const [currentFlow, setCurrentFlow] = useState("initial");
  const [showPassword, setShowPassword] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(""); // <-- store the OTP entered by user

  const [emailLogin, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const { getValidToken } = useAuth();

  const handleSendOTP = async () => {
    try {
      const token = await getValidToken();
      const payload = {
        mobile_number: mobileNumber.startsWith("91")
          ? mobileNumber
          : `91${mobileNumber}`,
      };

      const res = await fetch("/api/mobile_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Mobile Login Response 👉", data);

      if (res.ok) {
        // Only proceed if backend accepted mobile number
        setOtpSent(true);
        setCurrentFlow("otp");
      } else {
        console.error("Mobile login failed ❌", data);
      }
    } catch (error) {
      console.error("Mobile Login API Error ❌", error);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const token = await getValidToken();

      const payload = {
        mobile_number: mobileNumber.startsWith("91")
          ? mobileNumber
          : `91${mobileNumber}`,
        otp,
      };

      const res = await fetch("/api/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Verify OTP Response 👉", data);

      if (res.ok && data.status === "success") {
        const { company_id, user_id, group_id, name } = data.data; // ✅ include group_id
        const { access_token, refresh_token } = data.token;

        // Store session data, including group_id
        handleLogin({
          company_id,
          name,
          user_id,
          access_token,
          refresh_token,
          group_id,
        });

        toast.success(data.message || "You are successfully logged in! 🎉");

        // Conditional redirect based on group_id
        if (group_id == 4) {
          localStorage.setItem("access_token", access_token); // store for external URL
          window.location.href = `https://marketplace.yuukke.com/Oauth/tLogin/${access_token}`;
        } else {
          router.push(from || "/"); // existing behavior for group_id 3
        }
      } else {
        // Handle both structured and unstructured errors
        const errMsg =
          data.message ||
          data.error ||
          (typeof data === "string" ? data : "OTP verification failed ❌");

        toast.error(errMsg);
        console.warn("OTP verification failed ❌", data);
      }
    } catch (error) {
      toast.error("Something went wrong ❌");
      console.error("OTP Verification Error ❌", error);
    }
  };

  const handleReSendOTP = async () => {
    try {
      const token = await getValidToken();
      const payload = {
        mobile_number: mobileNumber.startsWith("91")
          ? mobileNumber
          : `91${mobileNumber}`,
      };

      const res = await fetch("/api/resend_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Mobile Login Response 👉", data);

      if (res.ok) {
        // Only proceed if backend accepted mobile number
        setOtpSent(true);
        setCurrentFlow("otp");

        // ✅ Success toast
        toast.success(
          data.message ||
            "OTP has been re-sent successfully! 📲 Check your phone."
        );
      } else {
        const errMsg =
          data.message ||
          data.error ||
          "Failed to resend OTP ❌ Please try again.";
        toast.error(errMsg);
        console.error("Resend OTP failed ❌", data);
      }
    } catch (error) {
      toast.error("Something went wrong while resending OTP ❌");
      console.error("Mobile Login API Error ❌", error);
    }
  };

  const handleMailLogin = async () => {
    try {
      const token = await getValidToken();

      const payload = {
        email: emailLogin, // ✅ from state
        password, // ✅ from state
      };

      const res = await fetch("/api/email_login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Email Login Response 👉", data);

      if (res.ok && data.status === "success") {
        const { company_id, user_id, group_id, name } = data.data; // ✅ include group_id
        const { access_token, refresh_token } = data.token;

        // Store session data, including group_id
        handleLogin({
          company_id,
          name,
          user_id,
          access_token,
          refresh_token,
          group_id,
        });

        toast.success(data.message || "You are successfully logged in! 🎉");

        // Conditional redirect based on group_id
        if (group_id == 4) {
          // Store access_token in sessionStorage for external URL
          sessionStorage.setItem("access_token", access_token);
          window.location.href = `https://marketplace.yuukke.com/Oauth/tLogin/${access_token}`;
        } else {
          router.push(from || "/"); // existing behavior
        }
      } else {
        toast.error(data.message || "OTP verification failed ❌");
      }
    } catch (error) {
      toast.error("Something went wrong ❌");
      console.error("Email Login API Error ❌", error);
    }
  };

  const handleRegister = async () => {
    // ✅ Validation
    if (!firstName.trim()) return toast.error("First Name is required");
    if (!lastName.trim()) return toast.error("Last Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Invalid email format");
    if (!mobile.trim()) return toast.error("Mobile number is required");
    if (!/^\d{10}$/.test(mobile))
      return toast.error("Mobile number must be 10 digits");

    try {
      const token = await getValidToken();
      const payload = {
        first_name: firstName,
        last_name: lastName,
        mobile_number: mobile.startsWith("91") ? mobile : `91${mobile}`,
        email: email,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Registration Response : ", data);

      if (res.ok && data?.success) {
        // ✅ Skip the drama, straight to login
        toast.success("Registration successful! Redirecting to login...");
        setCurrentFlow("initial");
      } else {
        // ❌ Show error toast
        const messageToShow =
          data?.keycloak_message === "USER_EXISTS"
            ? data?.keycloak_message || "User already exists ❌"
            : data?.message || "Registration failed ❌";

        toast.error(messageToShow);
      }
    } catch (error) {
      console.error("Register API Error ❌", error);
      toast.error("Something went wrong. Please try again!");
    }
  };

  const handleForgetSendOTP = async () => {
    try {
      const token = await getValidToken();
      const payload = {
        mobile_number: mobileNumber.startsWith("91")
          ? mobileNumber
          : `91${mobileNumber}`,
      };

      const res = await fetch("/api/forget_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // console.log("Forget mail Response 👉", data);

      if (res.ok) {
        // Only proceed if backend accepted mobile number
        setOtpSent(true);
        setCurrentFlow("checkmail");
      } else {
        console.error("failed ❌", data);
      }
    } catch (error) {
      console.error("API Error ❌", error);
    }
  };

  const handleForgetSendMail = async () => {
    if (!email?.trim()) return toast.error("Email is required 📧");
    if (!/\S+@\S+\.\S+/.test(email))
      return toast.error("Please enter a valid email address");

    try {
      const token = await getValidToken();
      const payload = { email };

      const res = await fetch("/api/forget_password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 🧩 Some backends return message instead of success
      const isActuallySuccess =
        res.ok ||
        data?.success === true ||
        data?.message?.toLowerCase().includes("sent successfully");

      if (isActuallySuccess) {
        toast.success("Password reset email sent! Check your inbox");
        setCurrentFlow("checkmail");
      } else {
        const errorMsg =
          data?.message || "Failed to send password reset mail ❌";
        toast.error(errorMsg);
        console.error("Forget email failed ❌", data);
      }
    } catch (error) {
      console.error("API Error ❌", error);
      toast.error("Something went wrong. Please try again!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const renderInitialScreen = () => (
    <div className="min-h-screen flex flex-col pt-40 px-4">
      {/* Logo + Branding */}
      <div className="text-center mb-8">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-md text-gray-200 mt-12 ">
          By tapping Sign in, you agree to our <br />
          <a
            href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
            className="underline underline-offset-2 text-sm text-orange-50 hover:text-orange-100"
          >
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Sign-In Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-6 rounded-3xl">
          <CardContent className="space-y-8">
            {/* ⬅ Removed extra padding here */}

            {/* Mobile */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentFlow("mobile")}
                className="w-full h-12 text-white text-[1rem] !font-extrabold border border-white !rounded-full flex items-center justify-start px-4 bg-transparent hover:bg-white hover:text-gray-800 transition-colors duration-300 uppercase"
              >
                <Image
                  src="/telephone.png"
                  alt="Mobile"
                  width={25}
                  height={25}
                  className="mr-3"
                />
                Sign in with Mobile Number
              </Button>
            </motion.div>

            {/* Email */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setCurrentFlow("email")}
                variant="outline"
                className="w-full h-12 border border-gray-300 text-white text-[1rem] !font-extrabold !rounded-full flex items-center justify-start px-4 bg-transparent hover:bg-white hover:text-gray-900 transition-colors duration-300 uppercase"
              >
                <Image
                  src="/email.png"
                  alt="Email"
                  width={25}
                  height={25}
                  className="mr-3"
                />
                Sign in with Email
              </Button>
            </motion.div>

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
            </div> */}

            {/* Register (inline) */}
            <p className="text-center text-sm text-white mt-10">
              New user?{" "}
              <a
                onClick={() => setCurrentFlow("register")}
                className="cursor-pointer text-orange-50 hover:text-orange-100 font-medium underline ml-1"
              >
                Create New Account
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  const renderMobileScreen = () => (
    <motion.div
      key="mobile"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-md !font-extrabold text-gray-200 mt-10">
          Enter your register mobile number
        </p>
      </div>

      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="mobile"
              className="text-sm !font-extrabold text-white"
            >
              Mobile Number *
            </Label>
            <div className="relative mt-3">
              <Input
                id="mobile"
                type="tel"
                maxLength={10}
                placeholder="+91 (000) 000-0000"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl  placeholder-white text-white"
              />
            </div>
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleSendOTP}
              className="w-full h-12 text-black bg-white hover:bg-gray-950 hover:text-white !font-extrabold uppercase !rounded-full shadow-lg border-0 "
            >
              <Send className="mr-2 h-4 w-4" />
              Send OTP
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderOTPScreen = () => (
    <motion.div
      key="otp"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("mobile")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Enter OTP
          </CardTitle>
          <CardDescription className="text-gray-300">
            {"We've sent a 6-digit code to " + mobileNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-gray-200">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)} // update otp state
              className="h-12 text-center text-2xl font-mono tracking-widest border-2 border-gray-200 rounded-xl"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleVerifyOTP}
              className="w-full h-12 bg-gradient-to-r from-white to-gray-50 
             hover:from-black hover:to-gray-950 text-black hover:text-white 
             font-medium rounded-xl shadow-lg border-0"
            >
              Verify & Sign In
            </Button>
          </motion.div>

          <div className="text-center">
            <Button
              variant="ghost"
              className="text-orange-50 hover:text-orange-100"
              onClick={handleReSendOTP}
            >
              Resend OTP
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEmailScreen = () => (
    <motion.div
      key="email"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Sign in with Email
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email input */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-100"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={emailLogin}
              onChange={(e) => setEmailLogin(e.target.value)} // ✅ track state
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-white"
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-100"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)} // ✅ track state
                placeholder="Enter your password"
                className="h-12 pr-12 border-2 border-gray-200 rounded-xl placeholder:text-white"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:text-gray-100 "
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-white" />
                ) : (
                  <Eye className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Button
              onClick={() => setCurrentFlow("forget")}
              variant="ghost"
              className="text-sm text-orange-50 hover:text-orange-100 p-0 underline"
            >
              Forgot password?
            </Button>
          </div>

          {/* Sign In */}
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={handleMailLogin}
          >
            <Button className="w-full h-12 bg-white hover:bg-gray-900 text-black hover:text-white !font-extrabold !rounded-full shadow-lg border-0">
              Sign In
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderRegisterScreen = () => (
    <motion.div
      key="register"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>
      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-50">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-300">
            Fill in your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-200"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-200"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerEmail"
              className="text-sm font-medium text-gray-200"
            >
              Email Address
            </Label>
            <Input
              id="registerEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="registerMobile"
              className="text-sm font-medium text-gray-200"
            >
              Mobile Number
            </Label>
            <Input
              id="registerMobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              placeholder="+91 000 000-0000"
              className="h-12 border-2 border-gray-200 rounded-xl placeholder:text-gray-300"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleRegister}
              className="w-full h-12 bg-gradient-to-r hover:from-black hover:to-gray-900 from-white to-gray-50 hover:text-white text-black font-extrabold text-sm rounded-xl shadow-lg border-0"
            >
              Register Now
            </Button>
          </motion.div>

          <p className="text-center text-sm text-gray-200 mt-12 ">
            {"By creating an account, you agree to our "}
            <a
              href="https://marketplace.yuukke.com/themes/yuukke/shop/assets/images/Yuukke-Privacy-Policy.pdf"
              className="underline underline-offset-2 text-sm text-orange-50 hover:text-orange-100"
            >
              Privacy Policy
            </a>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderForgetPassword = () => (
    <motion.div
      key="mobile"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-md !font-extrabold text-gray-200 mt-10">
          Enter your register Email account
        </p>
      </div>

      <Card className="border-0">
        <CardHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentFlow("initial")}
              className="p-2 hover:bg-gray-100 text-white hover:text-black rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-100"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 border-2 border-gray-200 rounded-xl  placeholder:text-white mt-3"
            />
          </div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              onClick={handleForgetSendMail}
              className="w-full h-12 text-black bg-white hover:bg-gray-950 hover:text-white !font-extrabold uppercase !rounded-full shadow-lg border-0 "
            >
              <Send className="mr-2 h-4 w-4" />
              Send Mail
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderCheckMail = () => (
    <motion.div
      key="mobile"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-md mx-auto -translate-y-0 md:-translate-y-16 "
    >
      <div className="mb-3">
        <Image
          src="/home_yuukke.png"
          alt="Yuukke Logo"
          width={200}
          height={200}
          className="mx-auto"
        />

        <p className="text-center text-2xl !font-extrabold text-red-200 mt-10">
          Check Your mail and Update your password!
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="h-[48rem] w-full md:min-h-screen bg-gradient-to-b from-pink-900  to-indigo-950  flex items-center justify-center p-4 font-odop">
      <AnimatePresence mode="wait">
        {currentFlow === "initial" && renderInitialScreen()}
        {currentFlow === "mobile" && renderMobileScreen()}
        {currentFlow === "otp" && renderOTPScreen()}
        {currentFlow === "email" && renderEmailScreen()}
        {currentFlow === "register" && renderRegisterScreen()}
        {currentFlow === "forget" && renderForgetPassword()}
        {currentFlow === "checkmail" && renderCheckMail()}
      </AnimatePresence>
    </div>
  );
}
