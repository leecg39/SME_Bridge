const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  distDir: isDev ? ".next-dev" : ".next",
  output: "standalone",
};

export default nextConfig;
