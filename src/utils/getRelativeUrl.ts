const rawBasePath = import.meta.env.BASE_URL || "/";
const normalizedBasePath = rawBasePath.endsWith("/")
  ? rawBasePath
  : `${rawBasePath}/`;
const baseUrl = new URL(normalizedBasePath, "https://example.com");

export function getRelativeUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, baseUrl).pathname;
}

export function stripBasePath(pathname: string) {
  const basePath = baseUrl.pathname.endsWith("/")
    ? baseUrl.pathname.slice(0, -1)
    : baseUrl.pathname;

  if (!basePath) {
    return pathname || "/";
  }

  if (pathname === basePath) {
    return "/";
  }

  return pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length) || "/"
    : pathname;
}
