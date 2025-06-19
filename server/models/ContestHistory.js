const mongoose = require("mongoose");

const contestHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  contestName: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  oldRating: {
    type: Number,
    required: true,
  },
  newRating: {
    type: Number,
    required: true,
  },
  unsolvedProblems: {
    type: Number,
    default: 0,
  },
  dateOfContest: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("ContestHistory", contestHistorySchema);
