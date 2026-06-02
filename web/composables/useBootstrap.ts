export function useBootstrap() {
  return useAsyncData('bootstrap', async () => {
    const [status, session] = await Promise.all([
      useApi<{ configured: boolean; site: { name: string; domain: string; previewDomain: string } }>('/config/status'),
      useApi<{ configured: boolean; user: null | { username: string; nickname: string } }>('/auth/session'),
    ]);

    return {
      status,
      session,
    };
  });
}
