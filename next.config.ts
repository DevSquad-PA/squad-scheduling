import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit Turbopack root to avoid Next inferring a wrong workspace root
  // (use project relative path). This silences warnings when multiple
  // lockfiles exist on the machine.
  turbopack: {
    root: ".",
  } as any,
};

export default nextConfig;
