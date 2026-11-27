const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Student = require('./models/Student');
const Course = require('./models/course');
const Enrollment = require('./models/enrollment');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cis3339_homework1';

function handleError(res, error, fallbackMessage) {
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((e) => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: 'Record already exists.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier format.' });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
}


app.get('/api/students', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { id: regex }];
    }
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  } catch (error) {
    handleError(res, error, 'Failed to fetch students.');
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, id, phone, zip } = req.body;
    if (!name?.trim() || !String(id ?? '').trim() || !phone?.trim() || !zip?.trim()) {
      return res
        .status(400)
        .json({ error: 'All fields (name, student ID, phone, and ZIP code) are required.' });
    }

    const existing = await Student.findOne({ id: String(id).trim() });
    if (existing) {
      return res
        .status(409)
        .json({ error: `Student ID "${String(id).trim()}" already exists.` });
    }

    const student = await Student.create({
      name: name.trim(),
      id: String(id).trim(),
      phone: phone.trim(),
      zip: zip.trim()
    });

    res.status(201).json(student);
  } catch (error) {
    handleError(res, error, 'Failed to add student.');
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    await Enrollment.deleteMany({ student: deleted._id });
    res.json({ message: 'Student and related enrollments deleted.', student: deleted });
  } catch (error) {
    handleError(res, error, 'Failed to delete student.');
  }
});


app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseId: 1 });
    res.json(courses);
  } catch (error) {
    handleError(res, error, 'Failed to fetch courses.');
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { courseId, courseName } = req.body;
    if (!courseId?.trim() || !courseName?.trim()) {
      return res
        .status(400)
        .json({ error: 'Both Course ID and Course Name are required.' });
    }

    const existing = await Course.findOne({ courseId: courseId.trim() });
    if (existing) {
      return res
        .status(409)
        .json({ error: `Course ID "${courseId.trim()}" already exists.` });
    }

    const course = await Course.create({
      courseId: courseId.trim(),
      courseName: courseName.trim()
    });

    res.status(201).json(course);
  } catch (error) {
    handleError(res, error, 'Failed to add course.');
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    await Enrollment.deleteMany({ course: deleted._id });
    res.json({ message: 'Course and related enrollments deleted.', course: deleted });
  } catch (error) {
    handleError(res, error, 'Failed to delete course.');
  }
});


app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res
        .status(400)
        .json({ error: 'Both a student and a course must be selected.' });
    }

    const [student, course] = await Promise.all([
      Student.findById(studentId),
      Course.findById(courseId)
    ]);

    if (!student) {
      return res.status(404).json({ error: 'Selected student does not exist.' });
    }
    if (!course) {
      return res.status(404).json({ error: 'Selected course does not exist.' });
    }

    const existing = await Enrollment.findOne({
      student: student._id,
      course: course._id
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: `${student.name} is already enrolled in ${course.courseId}.` });
    }

    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id
    });

    const populated = await enrollment.populate(['student', 'course']);
    res.status(201).json(populated);
  } catch (error) {
    handleError(res, error, 'Failed to create enrollment.');
  }
});

app.get('/api/courses/:id/students', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const enrollments = await Enrollment.find({ course: course._id }).populate('student');
    const students = enrollments
      .map((e) => e.student)
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ course, students });
  } catch (error) {
    handleError(res, error, 'Failed to fetch course roster.');
  }
});


const distPath = path.resolve(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback for Vue Router history mode (Express 5 safe)
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}


async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    await Promise.all([
      Student.syncIndexes(),
      Course.syncIndexes(),
      Enrollment.syncIndexes()
    ]);
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();