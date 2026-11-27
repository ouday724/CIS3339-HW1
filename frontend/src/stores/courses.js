import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiRequest } from '../api/client';

export const useCourseStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchCourses() {
    loading.value = true;
    error.value = '';
    try {
      courses.value = await apiRequest('/api/courses');
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function addCourse(payload) {
    error.value = '';
    const created = await apiRequest('/api/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    courses.value.push(created);
    courses.value.sort((a, b) => a.courseId.localeCompare(b.courseId));
    return created;
  }

  async function deleteCourse(mongoId) {
    error.value = '';
    await apiRequest(`/api/courses/${mongoId}`, { method: 'DELETE' });
    courses.value = courses.value.filter((c) => c._id !== mongoId);
  }

  return { courses, loading, error, fetchCourses, addCourse, deleteCourse };
});