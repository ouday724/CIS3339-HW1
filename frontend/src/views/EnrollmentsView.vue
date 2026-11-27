<script setup>
import { ref, onMounted } from 'vue';
import { useStudentStore } from '../stores/students';
import { useCourseStore } from '../stores/courses';
import { useEnrollmentStore } from '../stores/enrollments';
import EnrollmentForm from '../components/EnrollmentForm.vue';
import StatusBanner from '../components/StatusBanner.vue';

const studentStore = useStudentStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();

const rosterCourseId = ref('');
const submitting = ref(false);
const feedback = ref({ type: 'info', message: '' });

onMounted(async () => {
  await Promise.all([studentStore.fetchStudents(), courseStore.fetchCourses()]);
});

async function handleEnroll({ studentId, courseId }) {
  submitting.value = true;
  feedback.value = { type: 'info', message: '' };
  try {
    await enrollmentStore.enrollStudent(studentId, courseId);
    feedback.value = { type: 'success', message: 'Student enrolled successfully.' };
    if (rosterCourseId.value === courseId) {
      await enrollmentStore.fetchCourseRoster(courseId);
    }
  } catch (err) {
    feedback.value = { type: 'error', message: err.message };
  } finally {
    submitting.value = false;
  }
}

async function handleListStudents() {
  feedback.value = { type: 'info', message: '' };
  await enrollmentStore.fetchCourseRoster(rosterCourseId.value);
}
</script>

<template>
  <section class="page">
    <StatusBanner :type="feedback.type" :message="feedback.message" />
    <StatusBanner v-if="enrollmentStore.error" type="error" :message="enrollmentStore.error" />

    <div class="card">
      <h2>Enroll Student in Course</h2>
      <p v-if="studentStore.students.length === 0 || courseStore.courses.length === 0" class="muted">
        Add at least one student and one course before creating enrollments.
      </p>
      <EnrollmentForm
        v-else
        :students="studentStore.students"
        :courses="courseStore.courses"
        :submitting="submitting"
        @enroll="handleEnroll"
      />
    </div>

    <div class="card">
      <h2>Students in Course</h2>
      <form class="inline-form" @submit.prevent="handleListStudents">
        <label for="roster-course" class="sr-only">Select Course</label>
        <select id="roster-course" v-model="rosterCourseId" required>
          <option value="" disabled>-- Select Course --</option>
          <option v-for="course in courseStore.courses" :key="course._id" :value="course._id">
            {{ course.courseName }} ({{ course.courseId }})
          </option>
        </select>
        <button type="submit" class="btn btn-primary" :disabled="!rosterCourseId">
          List Students
        </button>
      </form>

      <p v-if="enrollmentStore.loading" class="muted">Loading roster...</p>
      <p v-else-if="enrollmentStore.selectedCourse && enrollmentStore.roster.length === 0" class="muted">
        No students are currently enrolled in {{ enrollmentStore.selectedCourse.courseId }}.
      </p>

      <div v-else-if="enrollmentStore.roster.length > 0" class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Phone</th>
              <th>ZIP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in enrollmentStore.roster" :key="student._id">
              <td>{{ student.name }}</td>
              <td>{{ student.id }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.zip }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>