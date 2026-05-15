const express = require("express");

const {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  saveAllAssets,
  getTotalAssetValue,
} = require("../controllers/asset.controller");

const router = express.Router();

router.post("/assets/list", getAssets);
router.post("/assets/create", createAsset);
router.put("/assets/update", updateAsset);
router.patch("/assets/delete", deleteAsset);

router.post("/assets/save-all", saveAllAssets);
router.post("/assets/total", getTotalAssetValue);

module.exports = router;
