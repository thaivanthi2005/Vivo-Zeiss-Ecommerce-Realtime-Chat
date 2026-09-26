const crypto = require("crypto");
const qs = require("qs");
const moment = require("moment");

const  sortObject = (obj) => {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}


module.exports.createPaymentUrl = ( orderId, amount, ipAddr, orderInfo ) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let tmnCode = process.env.VNP_TMN_CODE;
  let secretKey = process.env.VNP_HASH_SECRET;
  let vnpUrl = process.env.VNP_URL;
  let returnUrl = process.env.VNP_RETURN_URL;

  let locale = "vn";
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = String(orderId);
  vnp_Params["vnp_OrderInfo"] =
    orderInfo || "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);

  let signData = qs.stringify(vnp_Params, { encode: false }); // chuyển chuỗi vnparams sang dạng key=value và encode:false thì ko mã hóa URL (yêu cầu này vì vnpay yêu cầu chuỗi thô ko mã hóa các kí tự đặc biệt)
  let hmac = crypto.createHmac("sha512", secretKey); //  tạo hàm mã hóa dữ liệu theo thuật toán sha512 theo secretKey mà vnpay cấp
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex"); //thêm vào hàm mã háo dũ liệu ( chuyển chuỗi vừa chuyển sang utf8 (mã hóa kí tự thành chuỗi byte) và sau đó xuất ra chuỗi ksi tự (hex) CHUỖI VÀ SỐ)
  vnp_Params["vnp_SecureHash"] = signed; //gán chữ kí vào vnp_SecureHash
  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false }); // nối toàn lại với nhau để làm URL chuyển đến tab thanh toán 

  return vnpUrl;
};


module.exports.verifyReturn = (query) => {
  let vnp_Params = { ...query };
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = process.env.VNP_HASH_SECRET;
  let signData = qs.stringify(vnp_Params, { encode: false }); // đây cũng là chuyển vnparam sang dạng key value
  let hmac = crypto.createHmac("sha512", secretKey); // mã hóa dùng thuật toán Sha512
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex"); // tạo chữ kí chuyển về bye cho signdata và xuất ra dạng chữ số hex

  let isValid =
    String(secureHash || "").toLowerCase() === String(signed).toLowerCase();

  return {
    isValid: isValid,
    responseCode: query["vnp_ResponseCode"],
    txnRef: query["vnp_TxnRef"],
    amount: Number(query["vnp_Amount"] || 0) / 100,
    message: isValid ? "Checksum ok" : "Checksum failed",
  };
};

module.exports.sortObject = sortObject;
