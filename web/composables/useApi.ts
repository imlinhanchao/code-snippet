type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export async function useApi<T>(path: string) {
  const config = useRuntimeConfig();
  const headers = import.meta.server
    ? useRequestHeaders(['cookie', 'accept-language'])
    : undefined;

  const response = await $fetch<ApiEnvelope<T>>(`${config.public.apiBase}${path}`, {
    headers,
    credentials: 'include',
  });

  return response.data;
}
