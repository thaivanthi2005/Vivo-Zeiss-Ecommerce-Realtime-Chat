const express = require("express");
const router = express.Router();
const controller = require("../../controller/client/checkout.controller");

router.get("/", controller.index);
router.post("/order", controller.order);
router.get("/success/:orderID", controller.success);
router.get("/vnpay_return",controller.vnpayReturn);


module.exports = router;
