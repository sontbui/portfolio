import type { NextConfig } from "next";

/**
 * Deployment target: Vercel (server runtime).
 *
 * The AI Portfolio Assistant needs a server to hold the OpenRouter key and run
 * retrieval + streaming, so the app is a standard (non-exported) Next.js app.
 * Marketing pages are still statically prerendered; only the chat route is
 * server-rendered on demand.
 *
 * `serverExternalPackages` keeps the local embedding runtime (Transformers.js)
 * out of the webpack bundle — it ships native/wasm assets that must be required
 * at runtime, not bundled.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@xenova/transformers"],
  // Ensure the generated knowledge snapshot is bundled with the chat function.
  outputFileTracingIncludes: {
    "/api/chat": ["./data/**"],
  },
};

export default nextConfig;
