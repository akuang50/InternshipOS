import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@internshipos/ai", "@internshipos/api", "@internshipos/types", "@internshipos/ui"],
};

export default nextConfig;
