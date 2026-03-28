/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "media.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "eu-west-2.graphassets.com",
      },
      {
        protocol: "https",
        hostname: "eu-west-2.cdn.hygraph.com", 
      },
    ],
  },
};

export default nextConfig;