<script setup>
defineProps({
  type: {
    type: String,
    default: 'info' // 'success' | 'error' | 'info'
  },
  message: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div v-if="message" :class="['banner', `banner-${type}`]" role="status">
    {{ message }}
  </div>
</template>