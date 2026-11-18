export function authDestination(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) {
    return '/dashboard';
  }

  const url = new URL(value, 'https://portal.invalid');
  if (url.origin !== 'https://portal.invalid' || (url.pathname !== '/dashboard' && !url.pathname.startsWith('/dashboard/'))) {
    return '/dashboard';
  }
  return url.pathname + url.search;
}
