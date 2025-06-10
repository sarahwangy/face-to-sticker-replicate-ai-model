/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pbxt.replicate.delivery",
        port: "",
        pathname: "/**",
      }
    ],
  },
};

export default config;
