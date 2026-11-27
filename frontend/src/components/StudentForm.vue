<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['submit']);
defineProps({
  submitting: { type: Boolean, default: false }
});

const form = reactive({
  name: '',
  id: '',
  phone: '',
  zip: ''
});

function handleSubmit() {
  emit('submit', { ...form }, () => {
    form.name = '';
    form.id = '';
    form.phone = '';
    form.zip = '';
  });
}
</script>

<template>
  <form class="form-grid" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="student-name">Name</label>
      <input id="student-name" v-model.trim="form.name" type="text" required placeholder="e.g., John" />
    </div>
    <div class="field">
      <label for="student-id">Student ID</label>
      <input id="student-id" v-model.trim="form.id" type="text" required placeholder="e.g., 1001" />
    </div>
    <div class="field">
      <label for="student-phone">Phone</label>
      <input id="student-phone" v-model.trim="form.phone" type="text" required placeholder="e.g., 555-1234" />
    </div>
    <div class="field">
      <label for="student-zip">ZIP Code</label>
      <input id="student-zip" v-model.trim="form.zip" type="text" required placeholder="e.g., 77001" />
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Adding...' : 'Add Student' }}
      </button>
    </div>
  </form>
</template>