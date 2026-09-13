const Order = require("../../models/order.model");
const Product = require("../../models/products.model")
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