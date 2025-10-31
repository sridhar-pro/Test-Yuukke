// app/admin/route.js
import { redirect } from "next/navigation";

export async function GET() {
  // Replace with your actual external URL
  redirect("https://marketplace.yuukke.com/admin/login");
}
