// controllers/ProductController.js

const Response = require("./Response");
const { ProductModel } = require("../models/PurchaseModel");
const { ExpenseModel, DailyExpenseModel } = require("../models");

class ExpenseController extends Response {
  // Create Expense
  createExpense = async (req, res) => {
    try {
      const { items } = req.body; 

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
          const { name, price } = item; 

          if (!name || price == null) {
            return this.sendResponse(req, res, {
              data: null,
              message: "Product name and price are required",
              status: 400,
            });
          }

          const newProduct = new ExpenseModel({
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

        const dailySales = await DailyExpenseModel.findOne({
          date: today,
        });
        if (dailySales) {
          dailySales.totalSales += totalSaleAmount;
          dailySales.totalTransactions += items.length;
          await dailySales.save();
        } else {
          // Create a new DailySales document for today
          const newDailySales = new DailyExpenseModel({
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

  // Get All Expense
  getAllExpense = async (req, res) => {
    try {
      const products = await ExpenseModel.find()
        .sort({ name: 1 }); // Sort alphabetically

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
  // getProductById = async (req, res) => {
  //   try {
  //     const productId = req.params.id;

  //     const product = await ProductModel.findById(productId).populate(
  //       "category",
  //       "name"
  //     );
  //     if (!product) {
  //       return this.sendResponse(req, res, {
  //         data: null,
  //         message: "Product not found",
  //         status: 404,
  //       });
  //     }

  //     return this.sendResponse(req, res, {
  //       data: product,
  //       message: "Product retrieved successfully",
  //       status: 200,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return this.sendResponse(req, res, {
  //       data: null,
  //       message: "Failed to retrieve product",
  //       status: 500,
  //     });
  //   }
  // };

  // Update Product
  // updateProduct = async (req, res) => {
  //   try {
  //     const productId = req.params.id;
  //     const { updatedData } = req.body;

  //     // Find the product by ID
  //     const product = await ProductModel.findById(productId);
  //     if (!product) {
  //       return this.sendResponse(req, res, {
  //         data: null,
  //         message: "Product not found",
  //         status: 404,
  //       });
  //     }

  //     // If SKU is being updated, check for uniqueness
  //     // if (sku && sku.toUpperCase() !== product.sku) {
  //     //   const existingSKU = await ProductModel.findOne({
  //     //     sku: sku.toUpperCase(),
  //     //   });
  //     //   if (existingSKU) {
  //     //     return this.sendResponse(req, res, {
  //     //       data: null,
  //     //       message: "Another product with the same SKU already exists",
  //     //       status: 400,
  //     //     });
  //     //   }
  //     //   product.sku = sku.toUpperCase();
  //     // }
  //     // Update other fields if provided
  //     if (updatedData?.name) product.name = updatedData?.name;
  //     if (updatedData?.dosage) product.dosage = updatedData?.dosage;
  //     // if (description) product.description = description;
  //     if (updatedData?.category) product.category = updatedData?.category;
  //     // if (brand) product.brand = brand;
  //     // if (genericName) product.genericName = genericName;
  //     if (updatedData?.price !== undefined) product.price = updatedData?.price;
  //     // if (discount !== undefined) product.discount = discount;
  //     if (updatedData?.stock !== undefined) product.stock = updatedData?.stock;
  //     // if (reorderLevel !== undefined) product.reorderLevel = reorderLevel;
  //     // if (expiryDate) product.expiryDate = expiryDate;

  //     await product.save();

  //     return this.sendResponse(req, res, {
  //       data: { product },
  //       message: "Product updated successfully",
  //       status: 200,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return this.sendResponse(req, res, {
  //       data: null,
  //       message: "Failed to update product",
  //       status: 500,
  //     });
  //   }
  // };

  // Delete Product
  // deleteProduct = async (req, res) => {
  //   try {
  //     const productId = req.params.id;

  //     const product = await ProductModel.findById(productId);
  //     if (!product) {
  //       return this.sendResponse(req, res, {
  //         data: null,
  //         message: "Product not found",
  //         status: 404,
  //       });
  //     }

  //     await ProductModel.deleteOne({ _id: productId });

  //     return this.sendResponse(req, res, {
  //       data: null,
  //       message: "Product deleted successfully",
  //       status: 200,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return this.sendResponse(req, res, {
  //       data: null,
  //       message: "Failed to delete product",
  //       status: 500,
  //     });
  //   }
  // };


  // get all daily expense
  getDailyExpense = async (req, res) => {
    try {
      const dailyExpense = await DailyExpenseModel.find().sort({ date: 1 });
      // const totalSales = dailySales ? dailySales.totalSales : 0;
      console.log(dailyExpense);
      return this.sendResponse(req, res, {
        data: { dailyExpense },
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

  // Get Expense By Date 
  getExpenseByDate = async (req, res) => {
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
      const products = await ExpenseModel.find({
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

  // Get Today Expense
  getTodayTotalExpense = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(11, 0, 0, 0); // Normalize to midnight
      const dailySales = await DailyExpenseModel.findOne({ date: today });
      const dailyExpense = dailySales ? dailySales.totalSales : 0;

      return this.sendResponse(req, res, {
        data: { dailyExpense },
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

module.exports = { ExpenseController };
