<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { processFile, setWindoSize } from '@renderer/utils/ipc-util';
import { NIcon, NP, NText, NUpload, NUploadDragger, useMessage } from 'naive-ui';
import { useNovelStore } from '@renderer/stores/novel';
import { onMounted, ref } from 'vue';

const novelStore = useNovelStore();
const message = useMessage();
const uploading = ref(false);

// 提取文件处理逻辑到独立函数
const handleProcessFile = async (file, content) => {
  try {
    const res = await processFile(file.name, content);
    if (res.success) {
      await novelStore.refresh();
      message.success('文件上传成功');
      return true;
    } else {
      message.error(res.message || '文件处理失败');
      return false;
    }
  } catch (error) {
    console.error('上传处理错误:', error);
    message.error('文件上传失败');
    return false;
  }
};

// 监听文件上传
const handleFileChange = async ({ file }) => {
  if (uploading.value) return;

  uploading.value = true;
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      await handleProcessFile(file, reader.result);
    } finally {
      uploading.value = false;
    }
  };

  reader.onerror = () => {
    message.error('读取文件失败');
    uploading.value = false;
  };

  reader.readAsText(file.file);
};

onMounted(() => {
  setWindoSize(300, 220);
});
</script>

<template>
  <NUpload
    class="empty-upload"
    directory-dnd
    default-upload
    accept=".txt"
    :show-file-list="false"
    :disabled="uploading"
    @change="handleFileChange"
  >
    <NUploadDragger class="upload-dragger flex flex-col p-0 items-center justify-center text-center">
      <div>
        <NIcon size="32" :depth="3">
          <Icon :icon="uploading ? 'ri:loader-4-line' : 'ri:upload-2-fill'" :class="{ 'animate-spin': uploading }" />
        </NIcon>
      </div>
      <NText class="text-sm">
        {{ uploading ? '正在处理文件...' : '点击或者拖动文件到该区域来上传' }}
      </NText>
      <NP depth="3" class="mt-1"> 暂时只支持TXT文件 </NP>
    </NUploadDragger>
  </NUpload>
</template>

<style lang="scss" scoped>
.upload-dragger {
  height: calc(100vh - 31px);
  padding: 0;
}
</style>
