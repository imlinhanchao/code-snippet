<template>
    <section class="share">
        <Input :value="iFrameCode" readonly>
            <Select v-model="iFrameHeight" slot="prepend" style="width: 80px">
                <Option v-for="h in iFrameHeights" :key="h" :value="h">{{ h }}px</Option>
            </Select>
            <Button 
                slot="prepend" 
                icon="md-eye" 
                @click="previewModal = true"
            ></Button>
            <Button 
                slot="append" 
                custom-icon="fa fa-files-o" 
                v-clipboard:copy="iFrameCode"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
            ></Button>
        </Input>
        <Modal v-model="previewModal" footer-hide class="iframe-modal">
            <section class="content">
                <iframe ref="iframe" 
                    class="preview"
                    width="100%"
                    :height="this.iFrameHeight"
                    :src="`${$config.base.domain}/embed/${snippet.id}`"
                    frameborder="0"
                >
                </iframe>
            </section>
        </Modal>
    </section>
</template>

<script>
export default {
    name: 'Share',
    props: {
        snippet: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            iFrameHeight: 320,
            previewModal: false,
        }
    },
    computed: {
        iFrameHeights() {
            return [ 320, 480, 560, 720, 960 ];
        },
        iFrameCode() {
            return `<iframe src="${this.$config.base.domain}/embed/${this.snippet.id}" width="100%" height="${this.iFrameHeight}" frameborder="0"></iframe>`;
        }
    },
    methods: {
        onCopy() {
            this.$Message.success(this.$t('copied'));
        },
        onError(e) {
            this.$Message.error(this.$t('copy_failed') + e.message);
        },
    }
}
</script>
<style lang="less">
.iframe-modal .ivu-modal {
    width: 576px!important;
}
@media (max-width: 576px) {
    .iframe-modal .ivu-modal {
        width: 100%!important;
        height: 100%!important;
        top: 0!important;
        margin: 0;
        .ivu-modal-content {
            height: 100%;
            .ivu-modal-body {
                height: 100%;
            }
            .content {
                display: flex;
                align-items: center;
                height: 100%;
            }
        }
    }
}
</style>