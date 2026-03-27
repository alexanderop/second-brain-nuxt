/** Mocks for #imports (Nuxt auto-imports) used outside Nuxt runtime */
export function useNuxtApp() {
  return {
    payload: { data: {} },
    static: { data: {} },
  };
}

export function useRoute() {
  return { path: "/", params: {}, query: {} };
}

export function useRouter() {
  return { push: () => {}, replace: () => {} };
}

export function queryCollection(_name: string) {
  const builder = {
    path: () => builder,
    first: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    where: () => builder,
    order: () => builder,
    limit: () => builder,
  };
  return builder;
}

export function preloadRouteComponents(_path: string) {
  return Promise.resolve();
}
