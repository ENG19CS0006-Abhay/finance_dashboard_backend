const express = require("express");

const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const financeRoutes = require("./routes/finance.routes");
const assetRoutes = require("./routes/asset.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://findash-jency-abhay.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", financeRoutes);
app.use("/api", assetRoutes);

module.exports = app;
