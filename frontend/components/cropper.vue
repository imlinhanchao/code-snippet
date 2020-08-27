<template>
    <section>
        <Modal v-model="avatarModal" @on-visible-change="$emit('input', avatarModal)" 
            :title="$t('cropper_title')" @on-ok="SaveAvatar" :loading="true">
            <section class="avatar-cropper">
                <vue-cropper v-if="avatarModal"
                    ref="cropper"
                    :src="src"
                    alt="Source Image"
                    :aspect-ratio="1"
                    :max-height="500"
                >
                </vue-cropper>
            </section>
        </Modal>
    </section>
</template>

<script>
import 'cropperjs/dist/cropper.css';
export default {
    name: 'Cropper',
    components: {
        VueCropper: () => import('vue-cropperjs')
    },
    props: {
        value: {
            type: Boolean,
            default: ''
        },
        src: {
            type: String,
            required: true
        },
        file: {
            required: true,
        }
    },
    watch: {
        value(val) {
            this.avatarModal = val;
        }
    },
    data() {
        return {
            avatarModal: false,
        }
    },
    mounted() {
        this.avatarModal = this.value;
    },
    methods: {
        SaveAvatar() {
            this.$refs.cropper.getCroppedCanvas().toBlob(async (data)=> {
                try {
                    let param = new FormData();
                    param.append('file', new File([data], this.file.name, { type: this.file.type }));
                    let rsp = await this.$axios.post(this.$root.uploadInterface, param, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    rsp = rsp && rsp.data;
                    if (rsp && rsp.state == 0) {
                        this.avatarModal = false;
                        this.$emit('save', rsp.data[0])
                    } else {
                        this.$Message.error(rsp.msg);
                    }
                } catch (err) {
                    this.$Message.error(err.message);
                }
            });
        }
    }
}
</script>

<style lang="less" scoped>
.avatar-cropper {
    max-height: 70vh;
    overflow: auto;
}
</style>
<style>
.cropper-view-box, .cropper-face {
    border-radius: 50%;
}
</style>