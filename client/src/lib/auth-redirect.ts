export function getLoginPath(redirectTo?: string) {
  const redirect =
    redirectTo ??
    `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}
