import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.71"],
  async headers() {
    const jsonHeader = [{ key: "Content-Type", value: "application/json" }];
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: jsonHeader,
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: jsonHeader,
      },
    ];
  },
};

export default nextConfig;
