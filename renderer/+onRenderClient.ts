import { createApp } from './app'

export default async function onRenderClient(pageContext: any) {
  const { Page, pageProps } = pageContext
  const app = createApp(Page, pageProps, pageContext)
  app.mount('#app')
}
