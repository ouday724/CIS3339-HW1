import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiRequest } from '../api/client';

export const useStudentStore = defineStore('students', () => {
  const students = ref([]);
  const loading = ref(false);
  const error = ref('');

  async function fetchStudents(search = '') {
    loading.value = true;
    error.value = '';
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      students.value = await apiRequest(`/api/students${query}`);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function addStudent(payload) {
    error.value = '';
    const created = await apiRequest('/api/students', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    students.value.push(created);
    students.value.sort((a, b) => a.name.localeCompare(b.name));
    return created;
  }

  async function deleteStudent(mongoId) {
    error.value = '';
    await apiRequest(`/api/students/${mongoId}`, { method: 'DELETE' });
    students.value = students.value.filter((s) => s._id !== mongoId);
  }

  return { students, loading, error, fetchStudents, addStudent, deleteStudent };
});