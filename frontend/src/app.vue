<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="container topbar-inner">
        <h1 class="brand">Student Management System</h1>
        <nav aria-label="Main navigation" class="nav">
          <RouterLink to="/students">Students</RouterLink>
          <RouterLink to="/courses">Courses</RouterLink>
          <RouterLink to="/enrollments">Enrollments</RouterLink>
        </nav>
      </div>
    </header>

    <main class="container">
      <RouterView />
    </main>
  </div>
</template>