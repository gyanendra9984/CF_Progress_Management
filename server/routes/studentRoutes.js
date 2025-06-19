const express = require("express");
const Student = require("../models/Student.js");
const ProblemHistory = require("../models/ProblemHistory.js");
const ContestHistory = require("../models/ContestHistory.js");
const axios = require("axios");

const router = express.Router();

// Create student
router.post("/add_student", async (req, res) => {
  const { name, email, phoneNumber, cfHandle } = req.body;

  try {
    // Call Codeforces API
    const cfResponse = await axios.get(
      `https://codeforces.com/api/user.info?handles=${cfHandle}`
    );

    const userInfo = cfResponse.data.result[0];
    const rating = userInfo.rating || 0;
    const maxRating = userInfo.maxRating || 0;
    const image = userInfo.titlePhoto || "";

    // Create student
    const student = await Student.create({
      name,
      email,
      phoneNumber,
      cfHandle,
      rating,
      maxRating,
      image,
    });

    res.status(201).json({ message: "Student added successfully", student });
  } catch (err) {
    console.error("Failed to add student:", err.message);
    res.status(400).json({ error: "Failed to add student" });
  }
});
  

//update student by ID
router.put("/update_student/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, cfHandle } = req.body;

  try {
    // Fetch latest data from Codeforces
    const cfResponse = await axios.get(
      `https://codeforces.com/api/user.info?handles=${cfHandle}`
    );

    const userInfo = cfResponse.data.result[0];
    const rating = userInfo.rating || 0;
    const maxRating = userInfo.maxRating || 0;
    const image = userInfo.titlePhoto || "";

    // Update student with latest data
    const update = {
      name,
      email,
      phoneNumber,
      cfHandle,
      rating,
      maxRating,
      image,
    };

    const student = await Student.findByIdAndUpdate(id, update, { new: true });
    res.json(student);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update student" });
  }
});


// delete student by ID
router.delete("/delete_student/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await ProblemHistory.deleteMany({ studentId: studentId });
    await ContestHistory.deleteMany({ studentId: studentId });

    res.json({
      message: "Student and all related records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student and related data:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting student data" });
  }
});
  
// Get student profile by ID
router.get("/get_profile/:id", async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const [contestStats, problemStats] = await Promise.all([
      ContestHistory.find({ studentId }),
      ProblemHistory.find({ studentId }),
    ]);

    const contests = contestStats.length;
    const problemsSolved = problemStats.length;

    let totalRank = 0;
    let bestRank = Infinity;

    contestStats.forEach((c) => {
      totalRank += c.rank;
      if (c.rank < bestRank) bestRank = c.rank;
    });

    const averageRank =
      contests > 0 ? Math.round(totalRank / contests) + "th" : "N/A";
    if (bestRank === Infinity) bestRank = "N/A";

    const summary = {
      name: student.name,
      handle: student.cfHandle,
      rating: student.rating,
      maxRating: student.maxRating,
      contests,
      problemsSolved,
        averageRank,
      image: student.image,
      bestRank,
    };

    res.json(summary);
  } catch (err) {
    console.error("Failed to fetch student summary:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});




// Get all students
router.get("/all_students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

module.exports = router;
