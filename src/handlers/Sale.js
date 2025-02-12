const Response = require("./Response");
const { SaleModel } = require("../models/SaleModel");
const { ProductModel } = require("../models");
const { DailySaleModel } = require("../models");
const { default: mongoose } = require("mongoose");

class SalesController extends Response {
  // Record a new sale
  recordSale = async (req, res) => {
    try {
      const { todaysPurchase, todaysExpense, cashInHand } = req.body; // `products` should be an array of { productId, quantity } objects.
      let totalSaleAmount = 0;

      try {
        if (!todaysPurchase || !todaysExpense || !cashInHand) {
          return this.sendResponse(req, res, {
            data: null,
            message:
              "Each product must have a valid product ID and a positive quantity",
            status: 400,
          });
        }
        const totalPrice = todaysPurchase + todaysExpense + cashInHand;
        totalSaleAmount += totalPrice;

        // Update DailySales
        const today = new Date();
        today.setHours(11, 0, 0, 0); // Normalize to midnight

        // Check if a sales record already exists for today
        const existingSale = await DailySaleModel.findOne({ date: today });

        if (existingSale) {
          return this.sendResponse(req, res, {
            data: null,
            message: "Sales record for today already exists",
            status: 400,
          });
        }

        const dailySales = await DailySaleModel.findOne({
          date: today,
        });
        if (dailySales) {
          dailySales.totalSales += totalSaleAmount;
          await dailySales.save();
        } else {
          // Create a new DailySales document for today
          const newDailySales = new DailySaleModel({
            date: today,
            totalSales: totalSaleAmount,
          });
          await newDailySales.save();
        }

        return this.sendResponse(req, res, {
          data: { dailySales },
          message: "Sales recorded successfully",
          status: 201,
        });
      } catch (error) {
        console.error(error);
        return this.sendResponse(req, res, {
          data: null,
          message: "Failed to record sales",
          status: 500,
        });
      }
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "An unexpected error occurred",
        status: 500,
      });
    }
  };

  getTodayTotalSales = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(11, 0, 0, 0); // Normalize to midnight
      const dailySales = await DailySaleModel.findOne({ date: today });
      const totalSales = dailySales ? dailySales.totalSales : 0;

      return this.sendResponse(req, res, {
        data: { totalSales },
        message: "Today's total sales retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve today's total sales",
        status: 500,
      });
    }
  };

  // Get all sales (optional, with filtering)
  getAllSales = async (req, res) => {
    try {
      const dailySale = await DailySaleModel.find().sort({ soldAt: -1 });
      return this.sendResponse(req, res, {
        data: dailySale,
        message: "All sales retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve sales",
        status: 500,
      });
    }
  };

  getMonthlySales = async (req, res) => {
    try {
      const monthlySales = await DailySaleModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalSales: { $sum: "$totalSales" }, // Adjust this based on your schema
          },
        },
        {
          $addFields: {
            monthName: {
              $arrayElemAt: [
                [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
                "$_id.month",
              ],
            },
          },
        },
        // { $sort: { "_id.year": -1, "_id.month": -1 } }, // Sort by latest month first
      ]);

      return this.sendResponse(req, res, {
        data: monthlySales,
        message: "Monthly sales retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve monthly sales",
        status: 500,
      });
    }
  };

  getYearlySales = async (req, res) => {
    try {
      const monthlySales = await DailySaleModel.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalSales: { $sum: "$totalSales" },
          },
        },
        {
          $addFields: {
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            },
            monthName: {
              $arrayElemAt: [
                [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
                "$_id.month",
              ],
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ]);

      // Initialize formattedData
      const formattedData = { year: {}, month: {} };

      monthlySales.forEach(({ _id, totalSales, monthName, date }) => {
        const { year, month, day } = _id;
        const formattedDate = date.toISOString().split("T")[0];

        // Ensure the year exists in formattedData
        if (!formattedData.year[year]) {
          formattedData.year[year] = [];
        }

        // Find or add month data
        let monthData = formattedData.year[year].find(
          (data) => data.monthName === monthName
        );

        if (!monthData) {
          monthData = { monthName, totalSales: 0 };
          formattedData.year[year].push(monthData);
        }

        // Accumulate totalSales per month
        monthData.totalSales += totalSales;

        // Ensure the month exists in formattedData.month
        if (!formattedData.month[monthName]) {
          formattedData.month[monthName] = [];
        }

        // Prevent duplicate days
        if (
          !formattedData.month[monthName].some(
            (data) => data.date === formattedDate
          )
        ) {
          formattedData.month[monthName].push({
            day: day,
            date: formattedDate,
            totalSales: totalSales,
          });
        }
      });

      return this.sendResponse(req, res, {
        data: formattedData,
        message: "Yearly sales retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve yearly sales",
        status: 500,
      });
    }
  };
  getCurrentWeek = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ message: "Please provide startDate and endDate" });
      }
  
      const sales = await DailySaleModel.find({
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1 });
  
      // Format the response to include date and day name
      const formattedSales = sales.map((sale) => ({
        date: sale.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        day: new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(sale.date),
        totalSales: sale.totalSales, // Assuming the model has totalSales field
      }));
  
      res.json({ data: formattedSales });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
 
}

module.exports = { SalesController };
