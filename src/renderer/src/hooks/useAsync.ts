import { ref, type Ref } from 'vue';
import { useThrottleFn, useDebounceFn } from '@vueuse/core';
import { createDiscreteApi } from 'naive-ui';

// 创建可在任何地方使用的消息API
const { message } = createDiscreteApi(['message']);

type AsyncOptions = {
  type?: 'throttle' | 'debounce';
  wait?: number;
};

// 定义 useAction 函数为常量
const useAsync = <T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: AsyncOptions = { type: 'debounce', wait: 300 }
) => {
  const loading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  const wrappedAction = async (...args: Parameters<T>) => {
    loading.value = true;
    error.value = null;
    try {
      return await action(...args);
    } catch (err: any) {
      error.value = err.message;
      message.error(err.message);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const debouncedOrThrottledAction =
    options.type === 'debounce'
      ? useDebounceFn(wrappedAction, options.wait || 300)
      : useThrottleFn(wrappedAction, options.wait || 300);

  return [debouncedOrThrottledAction, loading, error] as const;
};

export default useAsync;
