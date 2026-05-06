import { inject, App, InjectionKey } from 'vue'

export const pageContextSymbol: InjectionKey<any> = Symbol('pageContext')

export function usePageContext() {
  const pageContext = inject(pageContextSymbol)
  if (!pageContext) {
    throw new Error('usePageContext() must be called inside a component that is a descendant of PageShell')
  }
  return pageContext
}

export function setPageContext(app: App, pageContext: any) {
  app.provide(pageContextSymbol, pageContext)
}
