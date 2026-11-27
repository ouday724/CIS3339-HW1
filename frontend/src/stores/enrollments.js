import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiRequest } from '../api/client';

export const useEnrollmentStore = defineStore('enrollments', () => {
  const roster = ref([]);
  const selectedCourse = ref(null);
  const loading = ref(false);
  const error = ref('');

  async function enrollStudent(studentId, courseId) {
    error.value = '';
    return apiRequest('/api/enrollments', {
      method: 'POST',
      body: JSON.stringify({ studentId, courseId })
    });
  }

  async function fetchCourseRoster(courseId) {
    if (!courseId) {
      roster.value = [];
      selectedCourse.value = null;
      return;
    }
    loading.value = true;
    error.value = '';
    try {
      const data = await apiRequest(`/api/courses/${courseId}/students`);
      selectedCourse.value = data.course;
      roster.value = data.students;
    } catch (err) {
      error.value = err.message;
      roster.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { roster, selectedCourse, loading, error, enrollStudent, fetchCourseRoster };
});