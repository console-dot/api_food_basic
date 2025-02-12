const router = require("express").Router();
const user = require("./user");
const purchase = require("./purchase")
const sale = require("./sale");
const expense = require("./expense")

router.use("/user", user);
router.use("/purchase", purchase);
router.use("/sale", sale);
router.use("/expense",expense );

module.exports = { router };
