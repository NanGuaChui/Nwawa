<script lang="ts" setup>
import IconButton from '@renderer/components/IconButton.vue';
import { useAppStore } from '@renderer/stores/app';
import { setWindowSize } from '@renderer/utils/ipc-util';
import { NColorPicker, NForm, NFormItem, NInputNumber, NModal, NSlider } from 'naive-ui';
import { ref, watch } from 'vue';

const appStore = useAppStore();
const showModal = ref(false);
const model = ref({
  fontSize: appStore.textAttr.fontSize,
  color: appStore.textAttr.color,
  mouseOutTime: appStore.mouseOutTime,
  maxCharsPerLine: appStore.maxCharsPerLine
});

// 监听模型变化并更新到 store
watch(model, appStore.setTextAttr, { deep: true });

watch(showModal, (newValue) => {
  if (appStore.singleLineMode) {
    setWindowSize(newValue ? 'normal' : 'single');
  }
});

defineExpose({
  toggle: () => {
    showModal.value = !showModal.value;
  }
});
</script>

<template>
  <NModal v-model:show="showModal" class="min-w-[270px] max-w-[420px] w-4/5">
    <div class="bg-white p-2">
      <div class="flex justify-end">
        <IconButton icon="ri:close-fill" @click="showModal = false" />
      </div>
      <NForm :model="model" size="small" label-placement="left">
        <NFormItem path="fontSize" label="文字大小">
          <NSlider v-model:value="model.fontSize" :min="8" :max="16" />
        </NFormItem>
        <NFormItem path="color" label="文字颜色">
          <NColorPicker v-model:value="model.color" />
        </NFormItem>
        <NFormItem path="color" label="鼠标移开隐藏(秒)">
          <NInputNumber v-model:value="model.mouseOutTime" clearable />
        </NFormItem>
        <NFormItem path="maxCharsPerLine" label="单行最大字符数">
          <NInputNumber v-model:value="model.maxCharsPerLine" :min="10" :max="200" />
        </NFormItem>
      </NForm>
    </div>
  </NModal>
</template>

<style lang="scss" scoped></style>
