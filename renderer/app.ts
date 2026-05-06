import { createSSRApp, defineComponent, h, markRaw, reactive, Component } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import PageShell from './PageShell.vue'
import { setPageContext } from './usePageContext'
import en from '../i18n/en.json'
import zhChs from '../i18n/zh-chs.json'
import zhCht from '../i18n/zh-cht.json'

export { createApp }

function createApp(Page: Component, pageProps: Record<string, any> | undefined, pageContext: any) {
  const pageContextReactive = reactive(pageContext)

  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
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
  app.use(hljsVuePlugin)

  setPageContext(app, pageContextReactive)

  return app
}
