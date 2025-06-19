const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");

const connectDB = require("./config/db.js");
const studentRoutes = require("./routes/studentRoutes.js");
const contestRoutes = require("./routes/contestRoutes.js");
const problemRoutes = require("./routes/problemRoutes.js");
const Student = require("./models/Student.js");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/problems", problemRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Run at 2 AM every day
cron.schedule("0 2 * * *", async () => {
  console.log("Running 2 AM Codeforces sync job");

  try {
    const students = await Student.find();

    for (const student of students) {
      const body = {
        studentId: student._id,
        studentName: student.name,
        cfHandle: student.cfHandle,
      };

      try {
        const res = await axios.post(
          `http://localhost:${PORT}/api/contests/update_contests`,
          body
        );

        console.log(
          `Synced: ${student.name} (${student.cfHandle}) →`,
          res.data.message
        );
      } catch (innerErr) {
        console.error(`Error syncing ${student.name}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error("Failed to run cron job:", err.message);
  }
});
