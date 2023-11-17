/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/.*'],
  server: './server/index.ts',
  serverBuildPath: './build/index.mjs',
  serverDependenciesToBundle: [],
  // serverMinify: true,
  serverModuleFormat: 'esm',
  watchPaths: ['./server/**/*.ts'],
  // future: {
  //   v2_dev: true,
  //   v2_errorBoundary: true,
  //   v2_headers: true,
  //   v2_meta: true,
  //   v2_normalizeFormMethod: true,
  //   v2_routeConvention: true,
  // },
}
