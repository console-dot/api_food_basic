const router = require("express").Router();
const { PurchaseController } = require("../handlers");
const auth = require("../middleware/auth");
const refreshAuth = require("../middleware/refresh");

const handler = new PurchaseController();

router.post("/",handler.createPurchase);
router.get("/", handler.getAllProducts);
router.get("/daily-all-purchase", handler.getDailyPurchase);
router.get("/daily-purchase/:date", handler.getProductByDate);
router.get("/daily-purchase",handler.getTodayTotalPurchase)

module.exports = router;
