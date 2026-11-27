<script setup>
import { ref, onMounted } from 'vue';
import { useCourseStore } from '../stores/courses.js';
import CourseForm from '../components/CourseForm.vue';
import StatusBanner from '../components/StatusBanner.vue';

const courseStore = useCourseStore();
const submitting = ref(false);
const feedback = ref({ type: 'info', message: '' });

onMounted(() => {
  courseStore.fetchCourses();
});

async function handleAddCourse(payload, resetForm) {
  submitting.value = true;
  feedback.value = { type: 'info', message: '' };
  try {
    await courseStore.addCourse(payload);
    resetForm();
    feedback.value = { type: 'success', message: `Course "${payload.courseId}" added successfully.` };
  } catch (err) {
    feedback.value = { type: 'error', message: err.message };
  } finally {
    submitting.value = false;
  }
}

async function handleDelete(course) {
  if (!confirm(`Delete course ${course.courseId}? This will also remove its enrollments.`)) {
    return;
  }
  feedback.value = { type: 'info', message: '' };
  try {
    await courseStore.deleteCourse(course._id);
    feedback.value = { type: 'success', message: `Course "${course.courseId}" deleted.` };
  } catch (err) {
    feedback.value = { type: 'error', message: err.message };
  }
}
</script>

<template>
  <section class="page">
    <StatusBanner :type="feedback.type" :message="feedback.message" />
    <StatusBanner v-if="courseStore.error" type="error" :message="courseStore.error" />

    <div class="card">
      <h2>Add a Course</h2>
      <CourseForm :submitting="submitting" @submit="handleAddCourse" />
    </div>

    <div class="card">
      <h2>All Courses</h2>
      <p v-if="courseStore.loading" class="muted">Loading courses...</p>
      <p v-else-if="courseStore.courses.length === 0" class="muted">No courses available.</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courseStore.courses" :key="course._id">
              <td>{{ course.courseId }}</td>
              <td>{{ course.courseName }}</td>
              <td>
                <button type="button" class="btn btn-danger" @click="handleDelete(course)">
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