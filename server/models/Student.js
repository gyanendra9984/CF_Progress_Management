const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    cfHandle: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    maxRating: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default:
        "https://cdn.vectorstock.com/i/2000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.avif",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
