import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "ec2-13-231-162-41.ap-northeast-1.compute.amazonaws.com",
    "ec2-54-238-44-187.ap-northeast-1.compute.amazonaws.com",
  ],
};

export default nextConfig;
