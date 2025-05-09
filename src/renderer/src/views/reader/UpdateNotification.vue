<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { NProgress, NModal, NButton, NSpace, NAlert, NSpin } from 'naive-ui';
import IconButton from '@renderer/components/IconButton.vue';
import { useAppStore } from '@renderer/stores/app';
import { setWindoSize } from '@renderer/utils/ipc-util';

const appStore = useAppStore();
const isShowModal = ref(false);
const updateInfo = ref<any>(null);
const downloadProgress = ref(0);
const status = ref('idle'); // idle, checking, available, downloading, downloaded, error

// 检查更新
const checkForUpdates = async () => {
  setWindoSize(300, 220);

  status.value = 'checking';
  isShowModal.value = true; // 显示模态窗口，展示检查状态
  try {
    await window.electron.ipcRenderer.invoke('update:check-for-updates');
  } catch (error) {
    console.error('检查更新失败', error);
    status.value = 'error';
  }
};

// 下载更新
const downloadUpdate = async () => {
  status.value = 'downloading';
  try {
    await window.electron.ipcRenderer.invoke('update:download-update');
  } catch (error) {
    console.error('下载更新失败', error);
    status.value = 'error';
  }
};

// 安装更新
const installUpdate = () => {
  window.electron.ipcRenderer.invoke('update:quit-and-install');
};

interface UpdateMessage {
  type: 'checking' | 'available' | 'not-available' | 'progress' | 'downloaded' | 'error';
  info?: {
    version: string;
    releaseNotes?: string;
  };
  progressObj?: {
    percent: number;
  };
  err?: Error;
}

// 处理更新消息
const handleUpdateMessage = (_event: any, message: UpdateMessage) => {
  console.log('更新消息:', message);

  status.value = message.type;
  switch (message.type) {
    case 'available':
      updateInfo.value = message.info;
      isShowModal.value = true;
      break;
    case 'progress':
      downloadProgress.value = Math.floor(message.progressObj?.percent || 0);
      break;
    case 'downloaded':
      updateInfo.value = message.info;
      break;
    case 'checking':
      break;
    case 'not-available':
      break;
    case 'error':
      console.error('更新错误:', message.err);
      break;
  }
};

onMounted(() => {
  // 监听更新消息
  window.electron.ipcRenderer.on('update-message', handleUpdateMessage);

  // 添加调试功能（仅在开发环境中可用）
  if (process.env.NODE_ENV === 'development') {
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey) {
        if (e.key === '1') {
          window.electron.ipcRenderer.invoke('debug:simulate-update-available');
        } else if (e.key === '2') {
          window.electron.ipcRenderer.invoke('debug:simulate-update-not-available');
        }
      }
    });
  }

  // 应用启动时自动检查更新
  if (appStore.autoCheckUpdate) {
    setTimeout(() => {
      checkForUpdates();
    }, 3000); // 延迟3秒检查，确保应用已完全加载
  }
});

onUnmounted(() => {
  // 移除监听
  window.electron.ipcRenderer.removeAllListeners('update-message');
});
</script>

<template>
  <IconButton icon="ri:loop-left-fill" text="检查更新" :style="appStore.fontCss" @click="checkForUpdates" />
  <NModal v-model:show="isShowModal" preset="dialog" title="发现新版本" :mask-closable="false" size="small">
    <template #default>
      <div class="update-content">
        <template v-if="status === 'available'">
          <NAlert type="info">
            <p>发现新版本: v{{ updateInfo?.version }}</p>
            <template v-if="updateInfo?.releaseNotes">
              <p>更新内容:</p>
              <div v-html="updateInfo?.releaseNotes" class="release-notes"></div>
            </template>
          </NAlert>
        </template>

        <template v-else-if="['progress', 'downloading'].includes(status)">
          <p>正在下载更新...</p>
          <NProgress
            type="line"
            :percentage="downloadProgress"
            :show-indicator="true"
            :processing="downloadProgress < 100"
          />
        </template>

        <template v-else-if="status === 'downloaded'">
          <NAlert type="success">更新已下载完成，重启应用后将安装新版本</NAlert>
        </template>

        <template v-else-if="status === 'error'">
          <NAlert type="error">更新过程中发生错误</NAlert>
        </template>

        <template v-else-if="status === 'checking'">
          <NAlert class="flex items-center">
            <template #icon>
              <NSpin size="small" />
            </template>
            检查更新中
          </NAlert>
        </template>

        <template v-else-if="status === 'not-available'">
          <NAlert type="info">当前已是最新版本</NAlert>
        </template>
      </div>
    </template>

    <template #action>
      <NSpace justify="end">
        <NButton v-if="status === 'available'" type="primary" @click="downloadUpdate"> 下载更新 </NButton>

        <NButton v-if="status === 'downloaded'" type="primary" @click="installUpdate"> 立即安装 </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.update-content {
  margin: 16px 0;
}

.release-notes {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
