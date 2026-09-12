const Order = require("../../models/order.model");

module.exports.index = async (req,res) =>{
    let find = {};

    const orders = await Order.find(find);

    res.render("admin/pages/orders/index",{
        pagetitle: "Đơn Hàng",
    orders: orders,
    })
}