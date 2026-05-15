const express = require("express");

const {
  getFinanceGoods,
} = require("../controllers/finance.controller");

const router = express.Router();

router.get("/finance-goods", getFinanceGoods);

module.exports = router;
