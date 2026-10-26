export function shouldRefresh({ inactiveAt, now, minimumAge, busy, connected }) {
  return connected && !busy && inactiveAt > 0 && now - inactiveAt >= minimumAge;
}
export function isExternal(url, current) {
  const next = new URL(url, current), here = new URL(current);
  return ['https:', 'http:'].includes(next.protocol) && (next.origin !== here.origin || next.pathname.startsWith('/boss-code-go/'));
}
