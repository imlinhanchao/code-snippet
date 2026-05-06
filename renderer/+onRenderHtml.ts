import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { createApp } from './app'

export default async function onRenderHtml(pageContext: any) {
  const { Page, pageProps } = pageContext
  const app = createApp(Page, pageProps, pageContext)
  const appHtml = await renderToString(app)

  return escapeInject`<!DOCTYPE html>
    <html lang="en" data-theme="light">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Code Snippet</title>
      <link rel="stylesheet" href="/assets/index.css" />
    </head>
    <body>
      <div id="app">${dangerouslySkipEscape(appHtml)}</div>
    </body>
    </html>`
}
