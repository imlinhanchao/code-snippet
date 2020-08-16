<template>
    <section class="comment-textarea">
        <p class="comment-reply" v-if="replyfloor >= 0">
            Reply <a :href="`#comment${replyfloor}`">#{{replyfloor+1}}</a>
            <a v-if="!comment.id" href="javascript:void(0)" style="border:0" @click="$emit('noreply')">
                <Icon custom="fa fa-times"></Icon>
            </a>
        </p>
        <section class="editor">
            <mavon-editor ref="md" v-model="comment.content"
                language="en" :subfield="false"
                toolbarsBackground="#1a1c1e"
                previewBackground="#232323"
                :placeholder="disabled ? ' ' : 'Leave a comment'"
                :toolbars="toolbars"
                codeStyle="railscasts"
                :externalLink="$markdown.externalLink"
                :autofocus="autofocus"
            ></mavon-editor>
            <section class="mask" v-if="disabled">
                <p>You can only comment until the email was <router-link to="/setting/security">verified</router-link>.</p>
            </section>
        </section>
        <p class="comment-submit">
            <Button v-if="cancelable" @click="$emit('cancel')">Cancel</Button>
            <Button type="success" @click="OnComment" :disabled="disabled || this.comment.content.trim() == ''">Comment</Button>
        </p>
    </section>
</template>

<script>
export default {
    name: 'Comment',
    props: {
        comment: {
            type: Object,
            required: true
        },
        autofocus: {
            type: Boolean,
            default: false
        },
        floor: {
            type: Number,
            default: -1
        },
        cancelable: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            toolbars: {
                bold: true, // 粗体
                italic: true, // 斜体
                header: true, // 标题
                underline: true, // 下划线
                strikethrough: true, // 中划线
                mark: true, // 标记
                superscript: true, // 上角标
                subscript: true, // 下角标
                quote: true, // 引用
                ol: true, // 有序列表
                ul: true, // 无序列表
                link: true, // 链接
                code: true, // code
                table: true, // 表格
                undo: true, // 上一步
                redo: true, // 下一步
                trash: true, // 清空
                alignleft: true, // 左对齐
                aligncenter: true, // 居中
                alignright: true, // 右对齐
                preview: true, // 预览
            }
        }
    },
    computed: {
        replyfloor() {
            return this.floor;
        }
    },
    methods: {
        async OnComment() {
            try {
                let rsp = await this.$store.dispatch(this.comment.id ? 'comment/update' : 'comment/create', this.comment);
                if (rsp.state != 0) return this.$root.message($m.ERROR, rsp.msg);
                let comment = rsp.data;
                this.$emit('ok', comment);
            } catch (error) {
                console.error(error.message);
                this.$root.message($m.ERROR, error.message);
            }
        },
    }
}
</script>
<style lang="less" scoped>
.comment-textarea {
    padding: 1em 0;
    .comment-reply {
        padding: 0 1em 1em;
        font-style: italic;
        a {
            border-bottom: 1px dashed #FFF;
        }
    }
    .comment-submit {
        text-align: right;
        margin-top:1em;
    }
}
.editor {
    position: relative;
    z-index: 0;
    .mask {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        text-align: center;
        display: flex;
        align-items: center;
        z-index: 9999;
        background: #aaa2;
        color: #9b9793;
        border-radius: 6px;
        p {
            height: 0;
            width: 100%;
            a {
                color: #2db7f5;
                border-bottom: 1px dashed #2db7f5;
            }
        }
    }
}
</style>
<style lang="less">
.comment-textarea {
    .v-note-wrapper {
        background: #232323;
        min-height: 200px;
    }
    .content-input-wrapper, .auto-textarea-wrapper, textarea {
        background-color: transparent!important;
        color: #e3e5e8
    }
    .v-note-wrapper .v-note-op {
        border-bottom-color: #373c3e;
    }
    .auto-textarea-wrapper .auto-textarea-input {
        color: inherit;
    }
    .add-image-link-wrapper {
        div.add-image-link {
            background: #131516;
            border-radius: 6px;
            width: 80%;
            left: 0;
            right: 0;
            margin: auto;
            padding: 1em;
            .op-btn {
                margin-top: 1em;
                &.op-btn.cancel:hover {
                    color: #e3e5e8;
                }
            }
            .input-wrapper {
                border-color: #373c3e;
                width: 90%;
                margin: 1em auto;
            }
            input {
                background: transparent;
            }
            i {
                color: #373c3e;
            }
        }
    }
}
@media (max-width: 480px) {
    .comment-textarea {
        .v-note-wrapper .v-note-op .v-left-item {
            >:nth-child(n + 8), >:nth-child(4) {
                display: none;
            }
        }
    }
}
</style>