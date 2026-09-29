const Order = require("../../models/order.model");
const Product = require("../../models/products.model")
const system_config = require("../../config/system");


// [GET] /
module.exports.index = async (req, res) => {
    const find = { deleted: false }; 

    const { status, paymentStatus, paymentMethod, keyword } = req.query;

    if (status) find.status = status;
    if (paymentStatus) find.paymentStatus = paymentStatus;
    if (paymentMethod) find.paymentMethod = paymentMethod;

    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), "i");
      find.$or = [
        { "userInfo.fullName": regex },
        { "userInfo.phone": regex },
      ];
    }

    const orders = await Order.find(find).sort({ createdAt: -1 });

    res.render("admin/pages/orders/index", {
      pagetitle: "Đơn Hàng",
      orders: orders,
      query: req.query,
    });
}

// [GET] /detail/:id
module.exports.detail = async (req, res) => {
    try {
        const orderId = req.params.id;
        let ALLtotalPrice = 0;
        const InfoOder = await Order.findOne({ _id: orderId }).lean();

        if (!InfoOder) {
            res.redirect(`${system_config.prefixAdmin}/orders`);
            return;
        }

        for (const item of InfoOder.products) {
            const InfoProduct = await Product.findOne({
                _id: item.product_id
            }).select('thumbnail title price discountPercentage -_id').lean();

            const unitPrice = InfoProduct.price - (InfoProduct.price * InfoProduct.discountPercentage / 100);
            const totalPrice = unitPrice * item.quantity;

            item.totalPrice = totalPrice;
            item.productInfo = InfoProduct;

            ALLtotalPrice = ALLtotalPrice + totalPrice;
        }
        InfoOder.totalPrice = ALLtotalPrice;
        InfoOder.id = InfoOder._id.toString();

        res.render("admin/pages/orders/detail", {
            pagetitle: "Chi Tiết Đơn Hàng",
            order: InfoOder,
        });
    } catch (error) {
        console.log(error);
        res.redirect(`${system_config.prefixAdmin}/orders`);
    }
};

//[PATCH] /change-status/:id
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


  //[PATCH] /change-payment-status/:id
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