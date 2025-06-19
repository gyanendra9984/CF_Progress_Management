const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const studentRoutes = require("./routes/studentRoutes.js");
const contestRoutes = require("./routes/contestRoutes.js");
const problemRoutes = require("./routes/problemRoutes.js");


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
