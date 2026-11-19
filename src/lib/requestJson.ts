export async function requestJson(url: string, timeout: number, init: RequestInit = {}) {
  const controller = new AbortController();
  const parent = init.signal;
  const cancel = () => controller.abort();
  if (parent?.aborted) cancel();
  else parent?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(cancel, Math.max(1, timeout));
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json().catch(() => null);
    return { response, data };
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener('abort', cancel);
  }
}
