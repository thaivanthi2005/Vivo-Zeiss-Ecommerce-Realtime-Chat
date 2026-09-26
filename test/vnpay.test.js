const vnpay = require("../helper/vnpay");

  describe("vnpay helper", () => {
    test("verifyReturn", () => {
      process.env.VNP_HASH_SECRET = "demo_test_jest"; // đây là gán biến tạm thời để test 

      const result = vnpay.verifyReturn({
        vnp_Amount: "1000000",
        vnp_ResponseCode: "00",
        vnp_TxnRef: "abc123",
        vnp_SecureHash: "chu_ky_ahihi",
      });

      expect(result.isValid).toBe(false); //kiểm tra xem nếu chữ ký sai có trả về false hay ko.. 
      expect(result.txnRef).toBe("abc123"); // mặc dù chữ kí sai nhưng vẫn trả về đúng mã đơn để quản lý ko trả về là toang
    });

    test("sortObject", () => {
      const sorted = vnpay.sortObject({ b: "2", a: "1" });
      expect(Object.keys(sorted)).toEqual(["a", "b"]);
    });
  });
