<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  loading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search games...',
  loading: false
});

const emit = defineEmits<Emits>();

const inputRef = ref<HTMLInputElement>();
const searchValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  searchValue.value = newValue;
});

watch(searchValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleSearch = () => {
  emit('search', searchValue.value);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleSearch();
  }
};

const clearSearch = () => {
  searchValue.value = '';
  emit('update:modelValue', '');
  emit('search', '');
};

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<template>
  <div class="relative max-w-md mx-auto">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg v-if="!loading" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div v-else class="animate-spin h-5 w-5 border-2 border-gray-300 border-t-bgg-primary rounded-full"></div>
      </div>
      
      <input
        ref="inputRef"
        v-model="searchValue"
        type="text"
        :placeholder="placeholder"
        @keydown="handleKeydown"
        class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-bgg-primary focus:border-transparent text-gray-900"
        :disabled="loading"
      />
      
      <div class="absolute inset-y-0 right-0 flex items-center">
        <button
          v-if="searchValue"
          @click="clearSearch"
          class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          type="button"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button
          @click="handleSearch"
          :disabled="loading || !searchValue.trim()"
          class="ml-1 mr-2 btn-primary text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
      </div>
    </div>
  </div>
</template>