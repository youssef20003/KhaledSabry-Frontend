/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5090",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
