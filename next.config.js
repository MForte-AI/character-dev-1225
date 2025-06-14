const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
})

const withPWA = require("next-pwa")({
  dest: "public"
})

module.exports = withBundleAnalyzer(
  withPWA({
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost"
        },
        {
          protocol: "http",
          hostname: "127.0.0.1"
        },
        {
          protocol: "https",
          hostname: "**"
        }
      ]
    },
    experimental: {
      serverComponentsExternalPackages: ["sharp", "onnxruntime-node"]
    },
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
      // Handle Cloudflare Workers runtime compatibility
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "cloudflare:sockets": false,
        "cloudflare:workers": false,
      };
      
      // Ignore cloudflare-specific imports completely
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^cloudflare:/,
        })
      );
      
      // Also handle node-specific modules that might cause issues
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          crypto: false,
          dns: false,
          child_process: false,
          pg: false,
          'pg-native': false,
        };
      }
      
      return config;
    }
  })
)
