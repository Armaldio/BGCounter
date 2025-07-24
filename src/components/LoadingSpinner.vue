<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
});

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8">
    <div 
      :class="[
        'animate-spin rounded-full border-4 border-gray-200 border-t-bgg-primary',
        sizeClasses[size]
      ]"
    ></div>
    <p v-if="text" class="mt-4 text-gray-600 text-center">{{ text }}</p>
  </div>
</template>