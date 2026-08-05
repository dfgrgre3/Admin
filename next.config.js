/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  output: 'standalone',
  // Enable React strict mode for better performance
  reactStrictMode: true,
  turbopack: {
    // Mirrors the webpack `resolve.alias` block below. Turbopack ignores the
    // `webpack` callback, so server-only / Node-only modules that are still
    // (even if only dynamically) reachable from Client Components must be
    // aliased here. ELK logging is registered server-side via
    // `src/lib/logging/register-server-logging`, but `winston` remains
    // dynamically imported by `unified-logger` (server-only at runtime) and
    // must be stubbed for the browser bundle to avoid bundling Node-only code.
    //
    // IMPORTANT: the stub must be applied to the `browser` condition ONLY.
    // A global alias to the empty stub previously also shadowed `winston` on
    // the server (node runtime), breaking the instrumentation hook with
    // "Cannot read properties of undefined (reading 'combine')" because
    // `src/lib/logging/elk-logger` (loaded by `src/instrumentation.ts`)
    // needs the real `winston.format` / `winston.createLogger`. With the
    // `browser` condition the node runtime falls back to the real package.
    resolveAlias: {
      winston: {
        browser: './src/lib/logging/empty.ts',
      },
    },
  },

  compiler: {
    // Keep errors in production logs, but do not ship development diagnostics.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // Optimize CSS in production
  experimental: {
    optimizeCss: process.env.NODE_ENV === 'production',
    // Reduce optimizePackageImports to only essential packages
    // to prevent JavaScript heap out of memory during compilation
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
    ],
    // Only the static `/uploads/:path*` rewrite is proxied by Next itself, and it
    // is read-only. API uploads go through route handlers in `src/app/api`, which
    // are not subject to this limit.
    proxyClientMaxBodySize: '10mb',
    scrollRestoration: true,
    // Reduce JavaScript execution time
    webpackMemoryOptimizations: true,
    // Enable modern JavaScript output (no transpilation of modern features)
    esmExternals: true,
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: process.env.ALLOW_SVG === 'true',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Performance optimizations
    unoptimized: process.env.NODE_ENV === 'development',
  },


  // Enable compression
  compress: true,

  async rewrites() {
    return [
      // NOTE: there is deliberately NO `/api/:path*` rewrite here.
      //
      // `rewrites()` returning a plain array is treated as `afterFiles`, which is
      // evaluated *before* dynamic App Router routes. A `/api/:path*` rewrite
      // therefore shadowed every dynamic API route — `/api/admin/upload/presign`,
      // `/api/admin/courses/[id]`, `/api/admin/users/[...path]` and the
      // `src/app/api/[...path]` catch-all — sending the browser request straight
      // to the Go API. That bypassed the proxy layer that enforces
      // `assertAdminApiPermission`, re-derives `X-CSRF-Token` from the
      // (URL-decoded) `_csrf` cookie, and strips `Origin`/`Referer`, producing
      // `403 {"error":"CSRF token validation failed"}` on those routes.
      //
      // All `/api/*` traffic must go through the route handlers in `src/app/api`,
      // which is the browser-facing security boundary.
      {
        source: '/uploads/:path*',
        destination: `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api').replace('/api', '')}/uploads/:path*`,
      },
    ];
  },

  // Remove powered by header
  poweredByHeader: false,


  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },

  // Configure webpack to handle path aliases
  webpack: (config, { dev, isServer, nextRuntime }) => {
    // Prevent Node.js modules from being bundled for client or Edge
    if (!isServer || nextRuntime === 'edge') {
      // Add aliases for node: scheme imports and server-side packages.
      // These remain necessary because `unified-logger` (used by Client Components via
      // `@/lib/logger`) dynamically imports the server-only `elk-logger` module; even though
      // that import is guarded by `isServer` at runtime, it is still statically included in the
      // client async chunk, so winston / @elastic/elasticsearch must be stubbed for the client.
      // Server-only modules are additionally guarded with `import 'server-only'` to fail fast
      // if they are ever imported into a Client Component graph.
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:assert': false,
        'node:path': false,
        'node:util': false,
        'node:fs': false,
        'node:console': false,
        'node:crypto': false,
        'node:diagnostics_channel': false,
        'node:dns': false,
        'node:https': false,
        'async_hooks': false,
        'node:async_hooks': false,
        'node:buffer': false,
        'winston': false,
        '@elastic/elasticsearch': false,
        // Replace the server-only ELK logger with a no-op stub on the client so its
        // `import 'server-only'` (and winston / @elastic/elasticsearch) never reaches the
        // browser bundle. ELK is never used on the client (enableELK is forced off via isServer).
        [require('path').resolve(__dirname, 'src/lib/logging/elk-logger')]:
          require('path').resolve(__dirname, 'src/lib/logging/elk-logger.client.ts'),
        [require('path').resolve(__dirname, 'src/lib/logging/elk-logger.ts')]:
          require('path').resolve(__dirname, 'src/lib/logging/elk-logger.client.ts'),
      };
    } else {
      // Server-side alias
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
        aggregateTimeout: 300,
        poll: false,
      };
    }

    config.performance = {
      hints: false,
      maxEntrypointSize: 300000,
      maxAssetSize: 300000,
    };

    return config;
  },

  // Configure headers for better caching (production only to avoid dev issues)
  async headers() {
    // Only apply custom headers in production to avoid breaking dev mode
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }

    const allowUnsafeCsp =
      process.env.ALLOW_UNSAFE_CSP === 'true' ||
      process.env.NEXT_PUBLIC_ALLOW_UNSAFE_CSP === 'true';

    const scriptSrc = [
      "'self'",
      ...(allowUnsafeCsp ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://s.ytimg.com',
    ].join(' ');

    const styleSrc = [
      "'self'",
      ...(allowUnsafeCsp ? ["'unsafe-inline'"] : []),
      'https://fonts.googleapis.com',
    ].join(' ');

    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              `style-src ${styleSrc}`,
              "img-src 'self' https: data: blob:",
              "font-src 'self' https://fonts.gstatic.com data:",
              "connect-src 'self' https://*.tolo.app https://*.vercel.app wss: ws: http://127.0.0.1:*",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
              "frame-ancestors 'none'",
              "media-src 'self' https: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Enable ISR revalidation
  staticPageGenerationTimeout: 600,

  productionBrowserSourceMaps: false,
};

// Add allowed origin for remote development HMR
nextConfig.allowedDevOrigins = [process.env.ALLOWED_DEV_ORIGIN, 'localhost'].filter(Boolean);

module.exports = withBundleAnalyzer(nextConfig);
