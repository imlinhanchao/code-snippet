import { renderToString } from '@vue/server-renderer'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { createApp } from './app'

const DEFAULT_LANG = 'en'
const DEFAULT_THEME = 'bumblebee'
const VALID_LANGS = ['en', 'zh-chs', 'zh-cht']
const VALID_THEMES = ['bumblebee', 'halloween']

function readCookieValue(cookie: string, key: string): string | null {
  const found = cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${key}=`))
  if (!found) return null
  return decodeURIComponent(found.slice(key.length + 1))
}

function readRequestCookie(pageContext: any): string {
  return (
    pageContext?.headers?.cookie ||
    pageContext?.request?.headers?.cookie ||
    pageContext?.req?.headers?.cookie ||
    ''
  )
}

export default async function onRenderHtml(pageContext: any) {
  const { Page, pageProps, headTags, bodyTags } = pageContext
  const cookie = readRequestCookie(pageContext)
  const theme = readCookieValue(cookie, 'app-theme') || DEFAULT_THEME
  const lang = readCookieValue(cookie, 'app-lang') || DEFAULT_LANG
  const safeTheme = VALID_THEMES.includes(theme) ? theme : DEFAULT_THEME
  const safeLang = VALID_LANGS.includes(lang) ? lang : DEFAULT_LANG
  const app = await createApp(Page, pageProps, pageContext)
  const appHtml = await renderToString(app)

  return escapeInject`<!DOCTYPE html>
    <html lang="${safeLang}" data-theme="${safeTheme}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Code Snippet</title>
      ${dangerouslySkipEscape(headTags || '')}
    </head>
    <body>
      <div id="app">${dangerouslySkipEscape(appHtml)}</div>
      ${dangerouslySkipEscape(bodyTags || '')}
    </body>
    </html>`
}
