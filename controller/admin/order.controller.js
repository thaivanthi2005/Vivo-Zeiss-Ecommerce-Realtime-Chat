const Order = require("../../models/order.model");

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

    const InfoOder = await Order.findOne({_id:orderId});

    if(!InfoOder){
        res.redirect(`${system_config.prefixAdmin}/orders`);
        return;
    }

    res.render("admin/pages/orders/detail",{
    pagetitle: "Chi Tiết Đơn Hàng",
    order: InfoOder,
    })
}