type LocaleCode = 'zhChs' | 'zhCht' | 'en';

const localeOptions = [
  { code: 'zhChs', name: '简体中文' },
  { code: 'zhCht', name: '繁體中文' },
  { code: 'en', name: 'English' },
] as const;

const messages: Record<LocaleCode, Record<string, string>> = {
  en: {
    nav_home: 'Home',
    nav_explore: 'Explore',
    nav_login: 'Login',
    nav_user: 'Profile',
    setup_title: 'Configuration required',
    setup_desc: 'Complete config.json first, then restart the migration stack.',
    home_title: 'Home',
    explore_title: 'Explore',
    login_title: 'Login',
    embed_title: 'Embed',
    snippet_title: 'Snippet',
    user_title: 'User',
    snippet_empty: 'No snippets yet.',
    snippet_files: 'Files',
    snippet_stars: 'Stars',
    snippet_comments: 'Comments',
    theme_light: 'Light',
    theme_dark: 'Dark',
  },
  zhChs: {
    nav_home: '首页',
    nav_explore: '探索',
    nav_login: '登录',
    nav_user: '用户',
    setup_title: '需要先完成配置',
    setup_desc: '请先写入单一 config.json，再重启新的迁移服务。',
    home_title: '首页',
    explore_title: '探索',
    login_title: '登录',
    embed_title: '嵌入页',
    snippet_title: 'Snippet',
    user_title: '用户页',
    snippet_empty: '暂无 Snippet。',
    snippet_files: '文件',
    snippet_stars: '收藏',
    snippet_comments: '评论',
    theme_light: '亮色',
    theme_dark: '暗色',
  },
  zhCht: {
    nav_home: '首頁',
    nav_explore: '探索',
    nav_login: '登入',
    nav_user: '用戶',
    setup_title: '需要先完成設定',
    setup_desc: '請先寫入單一 config.json，再重啟新的遷移服務。',
    home_title: '首頁',
    explore_title: '探索',
    login_title: '登入',
    embed_title: '嵌入頁',
    snippet_title: 'Snippet',
    user_title: '用戶頁',
    snippet_empty: '暫無 Snippet。',
    snippet_files: '檔案',
    snippet_stars: '收藏',
    snippet_comments: '評論',
    theme_light: '亮色',
    theme_dark: '暗色',
  },
};

function detectLocale(): LocaleCode {
  if (import.meta.server) {
    const headers = useRequestHeaders(['accept-language']);
    const acceptLanguage = headers['accept-language'] || '';
    if (acceptLanguage.toLowerCase().includes('zh-tw') || acceptLanguage.toLowerCase().includes('zh-hk')) {
      return 'zhCht';
    }
    if (acceptLanguage.toLowerCase().includes('zh')) {
      return 'zhChs';
    }
  }
  return 'en';
}

export function useI18n() {
  const localeCookie = useCookie<LocaleCode>('code-snippet-locale', {
    default: () => detectLocale(),
  });
  const locale = computed<LocaleCode>(() => localeCookie.value || detectLocale());

  const t = (key: string) => messages[locale.value][key] || key;

  const setLocale = (next: LocaleCode) => {
    localeCookie.value = next;
  };

  return {
    locale,
    locales: localeOptions,
    setLocale,
    t,
  };
}
