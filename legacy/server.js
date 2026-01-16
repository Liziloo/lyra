const express = require("express");
const app = express();
app.use(express.json());

// Import routes
const chatRoutes = require("./routes/chat");
const sessionRoutes = require("./routes/session");
const modelRoutes = require("./routes/model");

// Use routes
app.use("/chat", chatRoutes);
app.use("/session", sessionRoutes);
app.use("/model", modelRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
