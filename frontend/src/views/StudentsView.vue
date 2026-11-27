<script setup>
import { ref, onMounted } from 'vue';
import { useStudentStore } from '../stores/students';
import StudentForm from '../components/StudentForm.vue';
import StatusBanner from '../components/StatusBanner.vue';

const studentStore = useStudentStore();
const searchQuery = ref('');
const submitting = ref(false);
const feedback = ref({ type: 'info', message: '' });

onMounted(() => {
  studentStore.fetchStudents();
});

async function handleSearch() {
  feedback.value = { type: 'info', message: '' };
  await studentStore.fetchStudents(searchQuery.value);
}

async function handleResetSearch() {
  searchQuery.value = '';
  await studentStore.fetchStudents();
}

async function handleAddStudent(payload, resetForm) {
  submitting.value = true;
  feedback.value = { type: 'info', message: '' };
  try {
    await studentStore.addStudent(payload);
    resetForm();
    feedback.value = { type: 'success', message: `Student "${payload.name}" added successfully.` };
  } catch (err) {
    feedback.value = { type: 'error', message: err.message };
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(student) {
  if (!confirm(`Delete student ${student.name} (${student.id})? This will also remove their enrollments.`)) {
    return;
  }
  feedback.value = { type: 'info', message: '' };
  try {
    await studentStore.deleteStudent(student._id);
    feedback.value = { type: 'success', message: `Student "${student.name}" deleted.` };
  } catch (err) {
    feedback.value = { type: 'error', message: err.message };
  }
}
</script>

<template>
  <section class="page">
    <StatusBanner :type="feedback.type" :message="feedback.message" />
    <StatusBanner v-if="studentStore.error" type="error" :message="studentStore.error" />

    <div class="card">
      <h2>Add a Student</h2>
      <StudentForm :submitting="submitting" @submit="handleAddStudent" />
    </div>

    <div class="card">
      <h2>Search &amp; Manage Students</h2>
      <form class="inline-form" @submit.prevent="handleSearch">
        <label for="search-student" class="sr-only">Search by name or ID</label>
        <input
          id="search-student"
          v-model="searchQuery"
          type="text"
          placeholder="Search by student name or ID..."
        />
        <button type="submit" class="btn btn-primary">Search</button>
        <button v-if="searchQuery" type="button" class="btn btn-secondary" @click="handleResetSearch">
          Clear
        </button>
      </form>

      <p v-if="studentStore.loading" class="muted">Loading students...</p>
      <p v-else-if="studentStore.students.length === 0" class="muted">No students found.</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Phone</th>
              <th>ZIP</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in studentStore.students" :key="student._id">
              <td>{{ student.name }}</td>
              <td>{{ student.id }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>
              <td>
                <button type="button" class="btn btn-danger" @click="handleDelete(student)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>