import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
