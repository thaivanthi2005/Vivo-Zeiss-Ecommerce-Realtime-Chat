const pricenew = require("../helper/pricenew");

describe("pricenewSingle", () => {
    test("giảm 10% tính đúng", () => {
      const product = { price: 100000, discountPercentage: 10 };
      expect(pricenew.pricenewSingle(product)).toBe("90000");
    });

    test("giảm 0% giữ nguyên", () => {
      const product = { price: 50000, discountPercentage: 0 };
      expect(pricenew.pricenewSingle(product)).toBe("50000");
    });
  });