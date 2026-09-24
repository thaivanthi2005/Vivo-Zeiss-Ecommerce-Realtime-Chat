const Product = require("../../models/products.model");
const Category = require("../../models/category.model");
const Cart = require("../../models/cart.model");
const Order = require("../../models/order.model");
const productsHelper = require("../../helper/pricenew");
const vnpayHelper = require("../../helper/vnpay")

//[GET] /checkout
module.exports.index = async (req, res) => {
  const cart = await Cart.findOne({
    _id: req.cookies.cartId,
  });

  let productInfoList = [];

  if (cart.products.length > 0) {
    for (const item of cart.products) {
      const productInfo = await Product.findOne({
        _id: item.product_id,
      });
      if (productInfo) {
        productInfoList.push({
          ...productInfo._doc,
          quantity: item.quantity,
          pricenew: (
            (productInfo.price * (100 - productInfo.discountPercentage)) /
            100
          ).toFixed(0), // thêm giá mới
        });
      }
    }
  }
  res.render("client/pages/checkout/index", {
    pagetitle: "Đặt Hàng",
    productInfo: productInfoList,
  });
};

//[POST] /checkout/order
module.exports.order = async (req, res) => {
  const cartId = req.cookies.cartId;
  const { fullName, phone, address, paymentMethod } = req.body;
  const userInfo = { fullName, phone, address };
  const method = paymentMethod === "vnpay" ? "vnpay" : "cod";

  const cart = await Cart.findOne({
    _id: cartId,
  });
  if (!cart || !cart.products || cart.products.length === 0) {
    return res.redirect("/cart");
  }

  let totalPrice = 0;
  const products = [];
  for (const product of cart.products) {
    const objectProduct = {
      product_id: product.product_id,
      price: 0,
      discountPercentage: 0,
      quantity: product.quantity,
    };
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("price discountPercentage");

    if (!productInfo) {
      continue;
    }

    objectProduct.price = productInfo.price;
    objectProduct.discountPercentage = productInfo.discountPercentage;

    const pricenew = Math.round(
      (objectProduct.price * (100 - objectProduct.discountPercentage)) / 100,
    );
    totalPrice += pricenew * objectProduct.quantity;

    products.push(objectProduct);
  }

  if (products.length === 0) {
    return res.redirect("/cart");
  }

  const orderData = {
  cart_id: cartId,
  user_id: res.locals.user.id,
  userInfo: userInfo,
  products: products,
  paymentMethod: method,
  paymentStatus: "unpaid",
  totalPrice: totalPrice,
};

try {
  const order = new Order(orderData);
  await order.save();

  if (order.paymentMethod === "cod") {
    await Cart.updateOne({ _id: cartId }, { products: [] });
    return res.redirect(`/checkout/success/${order.id}`);
  }

  if (order.paymentMethod === "vnpay") {
    const paymentUrl = vnpayHelper.createPaymentUrl(
      order._id,
      order.totalPrice,
      req.ip,
      `Thanh toan don hang ${order._id}`
    );
    return res.redirect(paymentUrl);
  }

  return res.status(400).send("Phuong thuc thanh toan khong hop le");
} catch (err) {
  console.error("Checkout error:", err);
  return res.status(500).send("Da xay ra loi khi tao don hang");
}
  
};

//[GET]/success/:orderID
module.exports.success = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderID,
  });
  for (const product of order.products) {
    const productInfo = await Product.findOne({
      _id: product.product_id,
    }).select("title thumbnail");
    product.pricenew = productsHelper.pricenewSingle(product);
    product.productInfo = productInfo;
    product.totalPrice = product.pricenew * product.quantity;
  }
  order.totalPrice = order.products.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  res.render("client/pages/checkout/success", {
    pagetitle: "Đặt Hàng Thành Công",
    order: order,
  });
};
