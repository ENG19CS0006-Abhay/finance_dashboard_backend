const express = require("express");

const healthRoutes = require("./routes/health.routes");
const userRoutes = require("./routes/user.routes");
const financeRoutes = require("./routes/finance.routes");
const assetRoutes = require("./routes/asset.routes");

const app = express();

app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", financeRoutes);
app.use("/api", assetRoutes);

module.exports = app;
