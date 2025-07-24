<script setup lang="ts">
interface Props {
  message: string;
  retryable?: boolean;
}

interface Emits {
  (e: 'retry'): void;
}

const props = withDefaults(defineProps<Props>(), {
  retryable: false
});

const emit = defineEmits<Emits>();

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center">
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
      <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 class="text-lg font-semibold text-red-800 mb-2">Oops! Something went wrong</h3>
      <p class="text-red-700 mb-4">{{ message }}</p>
      
      <button
        v-if="retryable"
        @click="handleRetry"
        class="btn-primary"
      >
        Try Again
      </button>
    </div>
  </div>
</template>