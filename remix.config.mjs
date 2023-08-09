/** @type {import('@remix-run/dev').AppConfig} */
export default {
  // devServerBroadcastDelay: 1000,
  ignoredRouteFiles: ["**/.*"],
  server: "./server/index.ts",
  serverBuildPath: "./build/index.js",
  serverDependenciesToBundle: "all",
  // serverMinify: true,
  serverModuleFormat: "cjs",
  watchPaths: ["./server/**/*.ts"],
  future: {
    v2_dev: true,
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};
