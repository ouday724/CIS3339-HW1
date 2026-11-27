<script setup>
import { ref } from 'vue';

defineProps({
  students: { type: Array, required: true },
  courses: { type: Array, required: true },
  submitting: { type: Boolean, default: false }
});

const emit = defineEmits(['enroll']);
const selectedStudentId = ref('');
const selectedCourseId = ref('');

function handleSubmit() {
  if (!selectedStudentId.value || !selectedCourseId.value) return;
  emit('enroll', {
    studentId: selectedStudentId.value,
    courseId: selectedCourseId.value
  });
}
</script>

<template>
  <form class="form-grid" @submit.prevent="handleSubmit">
    <div class="field">
      <label for="enroll-student">Select Student</label>
      <select id="enroll-student" v-model="selectedStudentId" required>
        <option value="" disabled>-- Select Student --</option>
        <option v-for="student in students" :key="student._id" :value="student._id">
          {{ student.name }} ({{ student.id }})
        </option>
      </select>
    </div>

    <div class="field">
      <label for="enroll-course">Select Course</label>
      <select id="enroll-course" v-model="selectedCourseId" required>
        <option value="" disabled>-- Select Course --</option>
        <option v-for="course in courses" :key="course._id" :value="course._id">
          {{ course.courseName }} ({{ course.courseId }})
        </option>
      </select>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" :disabled="submitting || !selectedStudentId || !selectedCourseId">
        {{ submitting ? 'Enrolling...' : 'Enroll Student' }}
      </button>
    </div>
  </form>
</template>