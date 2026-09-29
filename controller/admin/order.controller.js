const Order = require("../../models/order.model");
const Product = require("../../models/products.model")
const system_config = require("../../config/system");

module.exports.index = async (req,res) =>{
    let find = {};

    const orders = await Order.find(find);

    res.render("admin/pages/orders/index",{
    pagetitle: "Đơn Hàng",
    orders: orders,
    })
}

module.exports.detail = async (req,res) =>{
    const orderId = req.params.id;
let ALLtotalPrice = 0;
    const InfoOder = await Order.findOne({_id:orderId}).lean();

    if(!InfoOder){
        res.redirect(`${system_config.prefixAdmin}/orders`);
        return;
    }

    for (const item of InfoOder.products) {
        const InfoProduct = await Product.findOne({
            _id: item.product_id
        }).select('thumbnail title price discountPercentage -_id').lean();
        
        const totalPrice = InfoProduct.price - (InfoProduct.price*InfoProduct.discountPercentage/100);
        
        item.totalPrice = totalPrice;
        item.productInfo = InfoProduct;

        ALLtotalPrice = ALLtotalPrice + totalPrice;
    }
    InfoOder.totalPrice = ALLtotalPrice;

    res.render("admin/pages/orders/detail",{
    pagetitle: "Chi Tiết Đơn Hàng",
    order: InfoOder,
    })
}

//[PATCH] /admin/orders/change-status/:id
  module.exports.changeStatus = async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;

    const allowed = ["pending", "confirmed", "shipping", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      req.session.error = ["Trạng thái không hợp lệ"];
      return res.redirect(`${system_config.prefixAdmin}/orders`);
    }

    await Order.updateOne({ _id: id }, { status: status });
    req.session.success = ["Cập nhật trạng thái đơn thành công"];
    return res.redirect(`${system_config.prefixAdmin}/orders/detail/${id}`);
  };


  //[PATCH] /admin/orders/change-payment-status/:id
  module.exports.changePaymentStatus = async (req, res) => {
    const id = req.params.id;
    const paymentStatus = req.body.paymentStatus;

    const allowed = ["unpaid", "paid", "failed", "refunded"];
    if (!allowed.includes(paymentStatus)) {
      req.session.error = ["Trạng thái thanh toán không hợp lệ"];
      return res.redirect(`${system_config.prefixAdmin}/orders/detail/${id}`);
    }

    await Order.updateOne({ _id: id }, { paymentStatus: paymentStatus });
    req.session.success = ["Cập nhật thanh toán thành công"];
    return res.redirect(`${system_config.prefixAdmin}/orders/detail/${id}`);
  };