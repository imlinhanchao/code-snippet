<template>
  <i :class="class_name"></i>
</template>

<script>
import FileIcons from 'file-icons-js';
import 'file-icons-js/css/style.css'
export default {
    name: 'FileIcon',
    props: {
        filename: {
            type: String,
            default: ''
        }
    },
    computed: {
        class_name() {
            return FileIcons.getClassWithColor(this.filename);
        }
    }
}
</script>

<style scoped>
i {
    font-style: normal;
}
i.icon:before {
    font-size: inherit;
    width: auto;
}
.js-icon:before {
    color: #f0db4f;
}
</style>