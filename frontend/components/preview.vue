<template>
    <section>
        <Modal v-model="previewModal" footer-hide fullscreen @on-visible-change="OnChange">
            <article slot="header">
                <section class="header">
                    <section class="info">
                        <img :src="snippet.username == $root.loginUser.username ? $root.fileUrl($root.loginUser.avatar, '/res/user.png') : `/api/account/avatar/${snippet.username}`" />
                        <h1>
                            <router-link :to="`/u/${snippet.username}`">{{snippet.username}}</router-link> <span> / </span>
                            <router-link :to="`/s/${snippet.id}`" :title="code">{{code}}</router-link>
                        </h1>
                        <span class="tags">
                            <Icon custom="fa fa-lock isprivate" v-if="snippet.private" title="Private"></Icon>
                            <Tooltip content="Right click to copy link" placement="bottom">
                                <a target="_blank" :href="`${$config.base.preview_url}/view/${snippet.id}/${code}`"><Icon custom="fa fa-link"></Icon></a>
                            </Tooltip>
                            <Tooltip content="Reload Web" placement="bottom">
                                <a @click="OnReload"><Icon custom="fa fa-refresh"></Icon></a>
                            </Tooltip>
                            <Tooltip content="Download Web" placement="bottom">
                                <a @click="OnDownload"><Icon custom="fa fa-download"></Icon></a>
                            </Tooltip>
                        </span>
                    </section>
                </section>
            </article>
            <section class="content">
                <i v-if="!loading" class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>
                <iframe v-show="loading" ref="iframe" class="preview" :src="`${$config.base.preview_url}/view/${snippet.id}/${code}`">

                </iframe>
            </section>
        </Modal>
    </section>
</template>

<script>
import JsZip from 'jszip';
import { saveAs } from 'file-saver';

export default {
    name: 'Preview',
    components: {
        Statistics: () => import('./statistics'), 
    },
    data() {
        return {
            previewModal: false,
            loading: false
        }
    },
    props: {
        value: {
            type: Boolean,
            default: false,
            required: true
        },
        snippet: {
            type: Object,
            default: {},
            required: true
        },
        code: {
            type: String,
            required: true
        }
    },
    mounted() {
        this.previewModal = this.value;
        this.$refs['iframe'].onload = () => {
            this.loading = true;
        }
        this.$uweb.trackPageview(
            this.$config.bash.domain + `/preview/${this.snippet.id}`, 
            this.$config.base.domain + location.path);

    },
    watch: {
        value(val) {
            if (this.previewModal != val) this.previewModal = val;
        },
        previewModal(val) {
            if (this.previewModal != val) {
                this.$emit("input", val);
            }
        }
    },
    methods: {
        OnChange (val) {
            this.$emit("input", val);
        },
        OnReload() {
            let iframe = this.$refs.iframe;
            this.loading = false;
            iframe.src = iframe.src;
        },
        OnDownload() {
            let jszip = new JsZip();
            this.snippet.codes.forEach(c => {
                jszip.file(c.filename, c.content);
            })
            let filename = this.code.replace(/.html$/, '');
            jszip.generateAsync({ type: 'blob' }).then((content) => {
                saveAs(content, `${filename}.zip`);
            });
        }
    }
}
</script>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: space-between;
    margin: -.5em;
    .statistics {
        font-size: .8em;
        padding-top: 3px;
    }
}
.info {
    display: flex;
    font-size: 1.4em;
    flex: 1;
    white-space: nowrap;
    width: 0;
    display: flex;
    align-items: center;
    img {
        width: 1.4em;
        height: 1.4em;
        display: inline-block;
        border: 1px solid #FFF;
        vertical-align: top;
        border-radius: 50%;
        background: #FFF;
        margin: 5px;
    }
    h1 {
        font-size: .8em;
        padding: 2px 0;
        font-weight: normal;
        vertical-align: top;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .tags {
        display: flex;
        align-items: center;
        padding: 0 1.2em 0 0;
        i {
            font-size: .7em;
            margin: 0 .3em;
        }
    }
}
.aside-info {
    color: #666;
    font-size: .8em;
    p {
        text-overflow: ellipsis;
        overflow: hidden;
    }
}
.preview {
    border: 0;
    border: 0;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
}
.content {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background: #FFF;
    color: #24292e;
}
</style>