// controllers/ProductController.js

const Response = require("./Response");
const { DailyPurchaseModel } = require("../models");
const { PurchaseModel } = require("../models/PurchaseModel");

class PurchaseController extends Response {
  // Create Purchase
  createPurchase = async (req, res) => {
    try {
      const { items } = req.body; // `products` should be an array of { productId, quantity } objects.
      // Validate input
      if (!Array.isArray(items) || items?.length === 0) {
        return this.sendResponse(req, res, {
          data: null,
          message: "Products array is required and cannot be empty",
          status: 400,
        });
      }

      let totalSaleAmount = 0;
      let saleRecords = [];
      let createdProducts = [];

      try {
        for (const item of items) {
          const { name, price } = item; // Destructure name and price for each item

          if (!name || price == null) {
            return this.sendResponse(req, res, {
              data: null,
              message: "Product name and price are required",
              status: 400,
            });
          }

          const newProduct = new PurchaseModel({
            name,
            price,
          });

          await newProduct.save(); // Save the product to the database
          createdProducts.push(newProduct); // Add the created product to the array

          totalSaleAmount += price;
        }

        // Update DailySales
        const today = new Date();
        today.setHours(11, 0, 0, 0); // Normalize to midnight

        const dailySales = await DailyPurchaseModel.findOne({
          date: today,
        });
        if (dailySales) {
          dailySales.totalSales += totalSaleAmount;
          dailySales.totalTransactions += items.length;
          await dailySales.save();
        } else {
          // Create a new DailySales document for today
          const newDailySales = new DailyPurchaseModel({
            date: today,
            totalSales: totalSaleAmount,
            totalTransactions: items.length,
          });
          await newDailySales.save();
        }

        return this.sendResponse(req, res, {
          data: { saleRecords },
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

  // Get All Products
  getAllProducts = async (req, res) => {
    try {
      const products = await PurchaseModel.find().sort({ name: 1 }); // Sort alphabetically

      return this.sendResponse(req, res, {
        data: products,
        message: "Products retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve products",
        status: 500,
      });
    }
  };

  // Get Single Product by ID
  getProductById = async (req, res) => {
    try {
      const productId = req.params.id;

      const product = await PurchaseModel.findById(productId).populate(
        "category",
        "name"
      );
      if (!product) {
        return this.sendResponse(req, res, {
          data: null,
          message: "Product not found",
          status: 404,
        });
      }

      return this.sendResponse(req, res, {
        data: product,
        message: "Product retrieved successfully",
        status: 200,
      });
    } catch (error) {
      console.error(error);
      return this.sendResponse(req, res, {
        data: null,
        message: "Failed to retrieve product",
        status: 500,
      });
    }
  };
  getProductByDate = async (req, res) => {
    try {
      const { date } = req.params; 
      if (!date) {
        return this.sendResponse(req, res, {
          data: null,
          message: "Date is required",
          success: false,
        });
      }
  
      // Convert to Date object
      const queryDate = new Date(date);
      if (isNaN(queryDate.getTime())) {
        return this.sendResponse(req, res, {
          data: null,
          message: "Invalid date format",
          success: false,
        });
      }
  
      // Find products where date matches (assuming a 'createdAt' or 'date' field)
      const products = await PurchaseModel.find({
        createdAt: {
          $gte: new Date(queryDate.setHours(0, 0, 0, 0)), // Start of the day
          $lt: new Date(queryDate.setHours(23, 59, 59, 999)), // End of the day
        },
      })
  
      if (!products.length) {
        return this.sendResponse(req, res, {
          data: null,
          message: "No products found for this date",
          success: false,
        });
      }
  
      return this.sendResponse(req, res, {
        data: products,
        message: "Products retrieved successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return this.sendResponse(req, res, {
        data: null,
        message: "An error occurred while fetching products",
        success: false,
      });
    }
  };
  

  // Get All Daily Sales
  getDailyPurchase = async (req, res) => {
    try {
      const dailySales = await DailyPurchaseModel.find().sort({ date: 1 });
      // const totalSales = dailySales ? dailySales.totalSales : 0;
      console.log(dailySales);
      return this.sendResponse(req, res, {
        data: { dailySales },
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

  getTodayTotalPurchase = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(11, 0, 0, 0); // Normalize to midnight
      const dailySales = await DailyPurchaseModel.findOne({ date: today });
      const dailyPurchase = dailySales ? dailySales.totalSales : 0;

      return this.sendResponse(req, res, {
        data: { dailyPurchase },
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

}

module.exports = { PurchaseController };
