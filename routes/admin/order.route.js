const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileUpload = multer();
const middleware = require("../../middleware/upload.middleware");
const controller = require("../../controller/admin/order.controller");

router.get("/",controller.index);
router.get("/detail/:id",controller.detail);
router.patch("/change-status/:id", controller.changeStatus);
router.patch("/change-payment-status/:id", controller.changePaymentStatus);

module.exports = router;