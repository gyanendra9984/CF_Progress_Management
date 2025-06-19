const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ProblemHistory = require("../models/ProblemHistory");
const axios = require("axios");

// router.post("/update_problems/:id", async (req, res) => {
//   const studentId = req.params.id;
//   const problems = req.body.problems;

//   if (!Array.isArray(problems)) {
//     return res.status(400).json({ message: "Invalid problems array" });
//   }

//   try {
//     // Get already stored problem IDs for this student
//     const existing = await ProblemHistory.find({ studentId });
//     const existingProblemIds = new Set(existing.map((p) => p.problemId));

//     // Filter out duplicates
//     const newEntries = problems
//       .filter((p) => !existingProblemIds.has(p.problemId))
//       .map((p) => ({
//         studentId: new mongoose.Types.ObjectId(studentId),
//         problemId: p.problemId,
//         problemRating: p.problemRating,
//         submissionDate: new Date(p.submissionDate),
//       }));

//     await ProblemHistory.insertMany(newEntries);
//     res.json({ message: `Inserted ${newEntries.length} new problem entries.` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to insert problems" });
//   }
// });



router.post("/update_problems", async (req, res) => {
  const { studentId, studentName, cfHandle } = req.body;

  if (!studentId || !cfHandle) {
    return res.status(400).json({ message: "Missing studentId or cfHandle" });
  }

  try {
    const resData = await axios.get("https://codeforces.com/api/user.status", {
      params: { handle: cfHandle },
    });

    if (resData.data.status !== "OK") {
      return res
        .status(400)
        .json({ message: "Failed to fetch from Codeforces" });
    }

    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const allOKSubs = resData.data.result.filter((s) => {
      const submissionTime = new Date(s.creationTimeSeconds * 1000);
      return s.verdict === "OK" && submissionTime >= ninetyDaysAgo;
    });

    const latestSubmissions = {};

    allOKSubs.forEach((s) => {
      const pid = `${s.problem.contestId}-${s.problem.index}`;
      const submissionTime = new Date(s.creationTimeSeconds * 1000);

      if (
        !latestSubmissions[pid] ||
        submissionTime > latestSubmissions[pid].submissionDate
      ) {
        latestSubmissions[pid] = {
          studentId,
          problemId: pid,
          problemRating: s.problem.rating || 0,
          submissionDate: submissionTime,
        };
      }
    });

    const formatted = Object.values(latestSubmissions);

    // Save filtered problems if not already present
    const existing = await ProblemHistory.find({ studentId });
    const existingIds = new Set(existing.map((p) => p.problemId));

    const newProblems = formatted.filter((p) => !existingIds.has(p.problemId));

    if (newProblems.length > 0) {
      await ProblemHistory.insertMany(newProblems);
    }

    return res.status(200).json({
      message: `Saved ${newProblems.length} problems (last 90 days) for ${studentName}`,
    });
  } catch (err) {
    console.error("Problem history update failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



// GET: Fetch problem history for a specific student
router.get("/get_problems/:id", async (req, res) => {
    const studentId  = req.params.id;
  
    try {
      const problems = await ProblemHistory.find({ studentId }).sort({
        submissionDate: -1,
      });
  
      // Format data for frontend use
      const formatted = problems.map((p) => ({
        date: p.submissionDate.toISOString().split("T")[0],
        rating: p.problemRating,
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error("Error fetching problem history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
module.exports = router;
