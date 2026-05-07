import { createSSRApp, defineComponent, h, reactive, Component } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import 'highlight.js/styles/github.css'
import './index.css'
import PageShell from './PageShell.vue'
import { setPageContext } from './usePageContext'
import en from '../i18n/en.json'
import zhChs from '../i18n/zh-chs.json'
import zhCht from '../i18n/zh-cht.json'

export { createApp }

const DEFAULT_LANG = 'en'
const DEFAULT_THEME = 'bumblebee'
const VALID_LANGS = ['en', 'zh-chs', 'zh-cht'] as const

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

function resolveInitialLang(pageContext: any): string {
  if (!import.meta.env.SSR) {
    const local = localStorage.getItem('app-lang')
    if (local && VALID_LANGS.includes(local as any)) return local
    const fromCookie = readCookieValue(document.cookie || '', 'app-lang')
    if (fromCookie && VALID_LANGS.includes(fromCookie as any)) return fromCookie
    const htmlLang = document.documentElement.lang
    if (htmlLang && VALID_LANGS.includes(htmlLang as any)) return htmlLang
    return DEFAULT_LANG
  }

  const fromCookie = readCookieValue(readRequestCookie(pageContext), 'app-lang')
  if (fromCookie && VALID_LANGS.includes(fromCookie as any)) return fromCookie
  return DEFAULT_LANG
}

async function createApp(Page: Component, pageProps: Record<string, any> | undefined, pageContext: any) {
  const pageContextReactive = reactive(pageContext)
  const initialLang = resolveInitialLang(pageContext)

  const i18n = createI18n({
    legacy: false,
    locale: initialLang,
    fallbackLocale: DEFAULT_LANG,
    messages: {
      en,
      'zh-chs': zhChs,
      'zh-cht': zhCht
    }
  })

  const RootComponent = defineComponent({
    render() {
      return h(PageShell, { pageContext: pageContextReactive }, {
        default: () => h(Page as Component, pageProps || {})
      })
    }
  })

  const app = createSSRApp(RootComponent)

  const pinia = createPinia()
  app.use(pinia)
  app.use(i18n)

  if (!import.meta.env.SSR) {
    const { default: hljsVuePlugin } = await import('@highlightjs/vue-plugin')
    app.use(hljsVuePlugin)

    i18n.global.locale.value = initialLang as any

    const savedTheme = localStorage.getItem('app-theme')
      || readCookieValue(document.cookie || '', 'app-theme')
      || DEFAULT_THEME
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  setPageContext(app, pageContextReactive)

  return app
}
