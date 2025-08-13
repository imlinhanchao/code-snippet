<template>
    <section class="code-render">
        <section class="code-header" v-if="header">
            <section class="filename">{{code.filename}}</section>
            <Action :snippet="snippet" :code="code" :render="isRender"  @source="source = arguments[0]"></Action>
        </section>
        <section class="code-content" :style="maxHeight ? { maxHeight: `${maxHeight}px`, overflow: 'auto' } : {}">
            <pre v-if="!isRender || source" v-hljs="code.content"><code></code></pre>
            <section class="render markdown-body" v-if="isMarkdown && !source" v-html="$markdown.mavonEditor.getMarkdownIt().render(code.content)"></section>
            <section class="render org-mode markdown-body" v-if="isOrg && !source" v-html="renderOrg(code.content)"></section>
            <section class="render ipynb markdown-body" v-if="isIpynb && !source" v-html="renderIpynb(code.content)"></section>
            <section class="render image" v-if="isImage && !source"><img :src="code.content" /></section>
            <section class="render svg" v-if="isSvg && !source" v-html="code.content"></section>
        </section>
        <slot></slot>
        <section class="render-switch" v-if="isRender && !header">
            <ButtonGroup shape="circle">
                <Button custom-icon="fa fa-eye" :type="!source ? 'error' : 'default'" @click="source = false"></Button>
                <Button custom-icon="fa fa-code" :type="source ? 'error' : 'default'" @click="source = true"></Button>
            </ButtonGroup>
        </section>
    </section>
</template>

<script>
import org from 'org';
//import * as ipynb from 'ipynb2html'
//import { Document as Doc } from 'nodom'
export default {
    name: 'CodeRender',
    components: {
        Action: () => import('../components/action'), 
    },
    props: {
        code: {
            type: Object,
            required: true
        },
        snippet: {
            type: Object,
            required: true
        },
        maxHeight: {
            type: [Number, Boolean],
            default: false
        },
        header: {
            type: Boolean,
            default: true,
        },
        onlySource: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            source: this.onlySource,
        }
    },
    computed: {
        isMarkdown() {
            return this.ext == 'md' || this.ext == 'markdown';
        },
        isOrg() {
            return this.ext == 'org';
        },
        isIpynb() {
            return this.ext == 'ipynb';
        },
        isImage() {
            return ['jpg', 'bmp', 'png', 'jpeg', 'gif', 'svg'].indexOf(this.ext) >= 0 && 
                !!this.code.content.match(/^data:image\/[\w+]+;base64,/);
        },
        isSvg() {
            return this.ext == 'svg' && this.code.content.indexOf('<?xml') == 0;
        },
        ext() {
            return this.$root.getCodeExt(this.code.filename);
        },
        isRender() {
            return this.isMarkdown || this.isOrg || /*this.isIpynb ||*/ this.isImage || this.isSvg;
        }
    },
    methods: {
        renderOrg(content) {
            let parser = new org.Parser();
            var orgDocument = parser.parse(content);
            var orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
                headerOffset: 1,
                exportFromLineNumber: false,
                suppressSubScriptHandling: false,
                suppressAutoLink: false
            });
            console.dir(orgHTMLDocument);

            let ele = document.createElement('div');
            ele.innerHTML = orgHTMLDocument.contentHTML;
            ele.querySelectorAll('pre code').forEach(block => hljs.highlightBlock(block));

            return ele.innerHTML;
        }/*,
        renderIpynb(content) {
            const renderNotebook = ipynb.createRenderer(new Doc())
            return renderNotebook(JSON.parse(content)).outerHTML;
        }*/
    }
}
</script>

<style lang="less" scoped>
.code-render {
    position: relative;
    .render-switch {
        position: absolute;
        top: 1em;
        right: 1em;
        z-index: 10;
        background: #1a1c1e;
        border-bottom-left-radius: 6px;
        border-top-left-radius: 6px;
    }
}
.code-header {
    background: #1a1c1e;
    padding: .5em;
    border: 1px solid #373c3e;
    border-bottom: 0;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    display: flex;
    justify-content: space-between;
    .filename {
        flex: 1;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
.code-content {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    border: 1px solid #373c3e;
    overflow: auto;
    height: 100%;
    pre {
        margin: 0;
    }
    code {
        font-size: .8em;
    }
    .render {
        padding: 1em 2em;
        background: #1b1b1b;
        color: #989796;
        overflow: auto;
        &.image {
            text-align: center;
            img {
                max-height: 20em;
            }
        }
    }
}
</style>
<style lang="less">
.render {
    svg {
        max-height: 20em;
    }
}
</style>