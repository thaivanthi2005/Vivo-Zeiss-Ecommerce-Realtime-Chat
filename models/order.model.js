const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
      cart_id: String,
      user_id: String,
      userInfo: {
        fullName: String,
        phone: String,
        address: String,
      },
      products: [
        {
          product_id: String,
          price: Number,
          discountPercentage: Number,
          quantity: Number,
        },
      ],
      // --- mới ---
      status: {
        type: String,
        enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        enum: ["cod", "vnpay"],
        default: "cod",
      },
      paymentStatus: {
        type: String,
        enum: ["unpaid", "paid", "failed", "refunded"],
        default: "unpaid",
      },
      totalPrice: Number,
      vnpayTxnRef: String, 
      deleted: { type: Boolean, default: false },
      deletedAt: Date,
    },
    { timestamps: true },
  );

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
