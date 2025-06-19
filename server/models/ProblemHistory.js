const mongoose = require("mongoose");

const problemHistorySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  problemId: {
    type: String,
    required: true,
  },
  problemRating: {
    type: Number,
    required: true,
  },
  submissionDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("ProblemHistory", problemHistorySchema);
