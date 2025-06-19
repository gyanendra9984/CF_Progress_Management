const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ContestHistory = require("../models/ContestHistory");
const Student = require("../models/Student");
const axios = require("axios");



const getUnsolvedCount = async (contestId, handle) => {
  try {
    const url = `https://codeforces.com/api/contest.standings?contestId=${contestId}&handles=${handle}`;
    const response = await axios.get(url);
    const userResults = response.data.result.rows[0].problemResults;

    let unsolvedCount = 0;
    for (let i = 0; i < userResults.length; i++) {
      if (userResults[i].points === 0) {
        unsolvedCount++;
      }
    }

    return unsolvedCount;
  } catch (error) {
    console.error(`Failed to fetch standings for contest ${contestId}:`, error);
    return 0;
  }
};

router.post("/update_contests", async (req, res) => {
  const { studentId, studentName, cfHandle } = req.body;

  if (!studentId || !cfHandle) {
    return res.status(400).json({ message: "Missing studentId or cfHandle" });
  }

  try {
    // Step 1: Get contest history
    const ratingRes = await axios.get(
      "https://codeforces.com/api/user.rating",
      {
        params: { handle: cfHandle },
      }
    );

    if (ratingRes.data.status !== "OK") {
      return res
        .status(400)
        .json({ message: "Failed to fetch from Codeforces" });
    }

    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const recentContests = ratingRes.data.result.filter(
      (entry) => new Date(entry.ratingUpdateTimeSeconds * 1000) >= oneYearAgo
    );
 

    // Step 3: Format contest data
    const formatted = await Promise.all(
      recentContests.map(async (entry) => {
          const unsolved = await getUnsolvedCount(entry.contestId, cfHandle);
          console.log("gggggggggggggggggggggggg", unsolved);
        return {
          studentId,
          contestName: entry.contestName,
          rank: entry.rank,
          oldRating: entry.oldRating,
          newRating: entry.newRating,
          unsolvedProblems: unsolved,
          dateOfContest: new Date(entry.ratingUpdateTimeSeconds * 1000),
        };
      })
    );

    // Step 4: Avoid duplicates
    const existing = await ContestHistory.find({ studentId });
    const existingNames = new Set(existing.map((e) => e.contestName));

    const newEntries = formatted.filter(
      (e) => !existingNames.has(e.contestName)
    );

    if (newEntries.length > 0) {
      await ContestHistory.insertMany(newEntries);
    }

    return res.status(200).json({
      message: `Saved ${newEntries.length} new contest entries for ${studentName}`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
  


router.get("/get_contests/:id", async (req, res) => {
    const studentId = req.params.id;

  try {
    const contests = await ContestHistory.find({ studentId }).sort({
      dateOfContest: -1,
    });

    // Map data to frontend format
    const formatted = contests.map((c) => ({
      name: c.contestName,
      date: c.dateOfContest.toISOString().split("T")[0],
      ratingChange: c.newRating - c.oldRating,
      rank: c.rank,
      unsolved: c.unsolvedProblems,
      newRating: c.newRating,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching contest history:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

  