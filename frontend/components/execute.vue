<template>
    <Modal v-model="executeModal" title="Execute Codes" width="500" :mask-closable="false" @on-visible-change="OnChange">
        <section class="content">
            
        </section>
        <section slot="footer" class="footer">
            <Button type="error" @click="OnExecute" :loading="loading">Execute</Button>
        </section>
    </Modal>
</template>

<script>
export default {
    name: 'Action',
    data() {
        return {
            executeModal: false,
            defaultInput: true,
            loading: false
        }
    },
    props: {
        value: {
            type: Boolean,
            default: false,
            required: true
        },
        input: {
            type: String,
            default: '',
            required: true
        }
    },
    mounted() {
        this.executeModal = this.value;
    },
    watch: {
        value(val) {
            if (this.executeModal != val) this.executeModal = val;
        },
        executeModal(val) {
            if (this.executeModal != val) {
                this.$emit("input", val);
            }
        },
        input(val) {
            if (this.input != val && this.defaultInput) {
                this.$emit("change", val);
            }
        }
    },
    computed: {
    },
    methods: {
        OnChange (val) {
            this.$emit("input", val);
        },
        OnExecute() {

        }
    }
}
</script>

<style lang="less" scoped>
.footer {
    button {
        width: 100%;
    }
}
</style>