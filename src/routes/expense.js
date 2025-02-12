const { ExpenseController } = require("../handlers");

const router = require("express").Router();


const handler = new ExpenseController();

router.post("/",handler.createExpense);
router.get("/", handler.getAllExpense);
router.get("/daily-all-expense", handler.getDailyExpense);
router.get("/daily-expense/:date", handler.getExpenseByDate);
router.get("/daily-expense", handler.getTodayTotalExpense);
module.exports = router