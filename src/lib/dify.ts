export function getDifyBaseUrl() {
  const rawUrl = process.env.DIFY_API_URL;
  if (!rawUrl) return null;

  const normalized =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `http://${rawUrl}`;

  return normalized.replace(/\/+$/, "");
}

export function getDifyChatApiKey() {
  return process.env.DIFY_API_CHATFLOW_KEY ?? null;
}
