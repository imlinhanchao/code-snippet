<template>
  <section>
    <section>
      <section v-for="(rev) in revisions" :key="rev.id" class="revision-item">
        <section class="revision-header">
          <span>
            <Time :title="new Date(rev.create_time * 1000).toLocaleString()" :time="rev.create_time"></Time>
          </span>
          <span>
            <Icon type="md-git-commit"></Icon> <span>{{rev.historys.length}} {{$t('changed_file')}}</span>
          </span>
        </section>
        <CodeDiff
          v-show="!rev.hidden"
          v-for="c in rev.historys"
          :key="c.id"
          :old-string="c.pre_content"
          :new-string="c.content"
          :filename="c.pre_filename"
          :newFilename="c.filename"
          :language="getLanguage(c.filename.split('.').pop())"
          output-format="side-by-side"
          theme="dark"
        />
      </section>
    </section>
    <p v-show="loading" class="loading"><i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i></p>
    <p :title="$t('more')" class="more" @click="getRevisions" v-if="!loading && total > 0">
      <Icon type="ios-more"></Icon>
    </p>
  </section>
</template>

<script>
import { CodeDiff, hljs } from 'v-code-diff'
export default {
  name: 'Revisions',
  components: {
    CodeDiff
  },
  props: {
    snippet: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      revisions: [],
      total: 0,
      loading: false,
      hljsLangs: [
        { ext: 'asm', name: 'asm', module: import('highlight.js/lib/languages/armasm') },
        { ext: 'c', name: 'c', module: import('highlight.js/lib/languages/c') },
        { ext: 'cc', name: 'cpp', module: import('highlight.js/lib/languages/cpp') },
        { ext: 'cpp', name: 'cpp', module: import('highlight.js/lib/languages/cpp') },
        { ext: 'cs', name: 'csharp', module: import('highlight.js/lib/languages/csharp') },
        { ext: 'css', name: 'css', module: import('highlight.js/lib/languages/css') },
        { ext: 'clj', name: 'clojure', module: import('highlight.js/lib/languages/clojure') },
        { ext: 'd', name: 'd', module: import('highlight.js/lib/languages/d') },
        { ext: 'go', name: 'go', module: import('highlight.js/lib/languages/go') },
        { ext: 'hs', name: 'haskell', module: import('highlight.js/lib/languages/haskell') },
        { ext: 'java', name: 'java', module: import('highlight.js/lib/languages/java') },
        { ext: 'json', name: 'json', module: import('highlight.js/lib/languages/json') },
        { ext: 'js', name: 'javascript', module: import('highlight.js/lib/languages/javascript') },
        { ext: 'jl', name: 'julia', module: import('highlight.js/lib/languages/julia') },
        { ext: 'kt', name: 'kotlin', module: import('highlight.js/lib/languages/kotlin') },
        { ext: 'lua', name: 'lua', module: import('highlight.js/lib/languages/lua') },
        { ext: 'nim', name: 'nim', module: import('highlight.js/lib/languages/nim') },
        { ext: 'pl', name: 'perl', module: import('highlight.js/lib/languages/perl') },
        { ext: 'pl6', name: 'perl', module: import('highlight.js/lib/languages/perl') },
        { ext: 'ts', name: 'typescript', module: import('highlight.js/lib/languages/typescript') },
        { ext: 'py', name: 'python', module: import('highlight.js/lib/languages/python') },
        { ext: 'rb', name: 'ruby', module: import('highlight.js/lib/languages/ruby') },
        { ext: 'rs', name: 'rust', module: import('highlight.js/lib/languages/rust') },
        { ext: 'php', name: 'php', module: import('highlight.js/lib/languages/php') },
        { ext: 'html', name: 'xml', module: import('highlight.js/lib/languages/xml') },
        { ext: 'xml', name: 'xml', module: import('highlight.js/lib/languages/xml') },
        { ext: 'css', name: 'css', module: import('highlight.js/lib/languages/css') },
        { ext: 'scss', name: 'scss', module: import('highlight.js/lib/languages/scss') },
        { ext: 'md', name: 'markdown', module: import('highlight.js/lib/languages/markdown') },
        { ext: 'markdown', name: 'markdown', module: import('highlight.js/lib/languages/markdown') },
        { ext: 'sh', name: 'bash', module: import('highlight.js/lib/languages/bash') },
        { ext: 'bash', name: 'bash', module: import('highlight.js/lib/languages/bash') },
        { ext: 'yml', name: 'yaml', module: import('highlight.js/lib/languages/yaml') },
        { ext: 'yaml', name: 'yaml', module: import('highlight.js/lib/languages/yaml') },
        { ext: 'ini', name: 'ini', module: import('highlight.js/lib/languages/ini') },
        { ext: 'dockerfile', name: 'dockerfile', module: import('highlight.js/lib/languages/dockerfile') },
        { ext: 'makefile', name: 'makefile', module: import('highlight.js/lib/languages/makefile') },
        { ext: 'bat', name: 'dos', module: import('highlight.js/lib/languages/dos') },
        { ext: 'cmd', name: 'dos', module: import('highlight.js/lib/languages/dos') },
        { ext: 'ps1', name: 'powershell', module: import('highlight.js/lib/languages/powershell') },
        { ext: 'psm1', name: 'powershell', module: import('highlight.js/lib/languages/powershell') },
        { ext: 'psd1', name: 'powershell', module: import('highlight.js/lib/languages/powershell') },
        { ext: 'coffee', name: 'coffeescript', module: import('highlight.js/lib/languages/coffeescript') },
        { ext: 'dart', name: 'dart', module: import('highlight.js/lib/languages/dart') },
        { ext: 'swift', name: 'swift', module: import('highlight.js/lib/languages/swift') },
        { ext: 'vb', name: 'vbnet', module: import('highlight.js/lib/languages/vbnet') },
        { ext: 'vbs', name: 'vbscript', module: import('highlight.js/lib/languages/vbscript') },
        { ext: 'sql', name: 'sql', module: import('highlight.js/lib/languages/sql') },
        { ext: 'swift', name: 'swift', module: import('highlight.js/lib/languages/swift') },
      ]
    }
  },
  mounted() {
    this.getRevisions();
  },
  methods: {
    async getRevisions() {
      this.loading = true;
      this.$store.dispatch('snippet/changes', { id: this.snippet.id, index: this.revisions.length }).then(async rsp => {
        this.total = rsp.data.length;
        await this.loadHljs(rsp.data.map(d => d.historys.map(f => f.filename.split('.').pop())).flat());
        this.revisions = this.revisions.concat(rsp.data);
        this.loading = false;
      }).catch(error => {
        this.$root.message($m.ERROR, error.message);
      }).finally(() => {
        this.loading = false;
      });
    },
    loadHljs(fileExts) {
      const langs = hljs.listLanguages();
      fileExts = fileExts.filter(ext => {
        let lang = this.hljsLangs.find(l => l.ext == ext);
        return lang && !langs.includes(lang.name);
      });
      return Promise.all(fileExts.map(async ext => {
        if (ext && this.hljsLangs.find(l => l.ext == ext)) {
          let lang = this.hljsLangs.find(l => l.ext == ext);
          if (!hljs.getLanguage(lang.name)) {
            let m = await lang.module;
            hljs.registerLanguage(lang.name, m);
          }
        }
      }));
    },
    getLanguage(ext) {
      let lang = this.hljsLangs.find(l => l.ext == ext);
      return lang ? lang.name : 'plaintext';
    }
  }
}
</script>
<style scoped lang="less">
  .revision-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8em;
  }
  .loading, .more {
    text-align: center;
    margin: 1em auto;
  }
  .more {
    cursor: pointer;
  }
  .more:hover {
    color: #1890ff;
  }
</style>