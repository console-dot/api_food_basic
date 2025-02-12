const router = require("express").Router();
const { SalesController } = require("../handlers");

const handler = new SalesController();

router.post("/", handler.recordSale);
router.get("/today", handler.getTodayTotalSales);
router.get("/all", handler.getAllSales);
router.get("/monthly-sale", handler.getMonthlySales);
router.get("/yearly-sale", handler.getYearlySales);
router.get("/weekly", handler.getCurrentWeek);
router.get("/darft", handler.getDraftSales);
router.put("/update", handler.getSaleUpdate);

module.exports = router;
