<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['submit']);
defineProps({
  submitting: { type: Boolean, default: false }
});

const form = reactive({
  courseId: '',
  courseName: ''
});

function handleSubmit() {
  emit('submit', { ...form }, () => {
    form.courseId = '';
    form.courseName = '';
  });
}
</script>

<template>
  <form class="form-grid" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="course-id">Course ID</label>
      <input id="course-id" v-model.trim="form.courseId" type="text" required placeholder="e.g., CIS 3339" />
    </div>
    <div class="field">
      <label for="course-name">Course Name</label>
      <input
        id="course-name"
        v-model.trim="form.courseName"
        type="text"
        required
        placeholder="e.g., Enterprise Applications Development"
      />
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Adding...' : 'Add Course' }}
      </button>
    </div>
  </form>
</template>