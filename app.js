const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/mentor_student_assignment", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const mentorSchema = new mongoose.Schema({
  name: String,
});

const studentSchema = new mongoose.Schema({
  name: String,
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
});

const Mentor = mongoose.model("Mentor", mentorSchema);
const Student = mongoose.model("Student", studentSchema);

app.use(bodyParser.json());

app.post("/api/mentors", async (req, res) => {
  try {
    const mentor = await Mentor.create(req.body);
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ error: "Could not create mentor" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Could not create student" });
  }
});

app.put(
  "/api/students/:studentId/assign-mentor/:mentorId",
  async (req, res) => {
    try {
      const { studentId, mentorId } = req.params;
      const student = await Student.findByIdAndUpdate(
        studentId,
        { mentor: mentorId },
        { new: true }
      );
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Could not assign mentor to student" });
    }
  }
);

app.put(
  "/api/students/:studentId/change-mentor/:newMentorId",
  async (req, res) => {
    try {
      const { studentId, newMentorId } = req.params;
      const student = await Student.findByIdAndUpdate(
        studentId,
        { mentor: newMentorId },
        { new: true }
      );
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Could not change mentor for student" });
    }
  }
);

app.get("/api/mentors/:mentorId/students", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const students = await Student.find({ mentor: mentorId });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch students for mentor" });
  }
});

app.get("/api/students/:studentId/previous-mentor", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const previousMentor = await Mentor.findById(student.mentor);
    res.json(previousMentor);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Could not fetch previous mentor for student" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
