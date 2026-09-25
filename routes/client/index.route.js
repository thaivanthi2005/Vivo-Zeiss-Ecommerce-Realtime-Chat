const Middleware = require("../../middleware/client/category.middleware");
const cart_middleware = require("../../middleware/client/cart.middleware");
const products_router = require("./products.route");
const home_router = require("./home.route");
const search_route = require("./search.route");
const cart_route = require("./cart.route");
const checkout_route = require("./checkout.route");
const orders_route = require("./orders.route");
const user_route = require("./user.route");
const users_route = require("./users.route");
const rooms_chat = require("./rooms-chat.route");
const chat_route = require("./chat.route");
const middleware_user = require("../../middleware/client/user.middleware");
const middleware_auth = require("../../middleware/client/auth.middleware");
const middleware_settings = require("../../middleware/client/settings.middlware");

const controller = require("../../controller/client/checkout.controller");
module.exports = (app) => {
  app.use(Middleware.categoryMiddleware);
  app.use(cart_middleware.checkcart);
  app.use(middleware_user.infoUser);
  app.use(middleware_settings.settingGeneral);
  app.use("/", home_router);
  app.use("/products", products_router);
  app.use("/search", search_route);
  app.use("/cart", middleware_auth.auth_middleware, cart_route);
  app.use("/checkout", middleware_auth.auth_middleware, checkout_route);
  app.use("/orders", middleware_auth.auth_middleware, orders_route);
  app.use("/user", user_route);
  app.use("/chat", middleware_auth.auth_middleware, chat_route);
  app.use("/users", middleware_auth.auth_middleware, users_route);
  app.use("/rooms-chat", middleware_auth.auth_middleware, rooms_chat);
  app.get(
      "/checkout/vnpay_return",
      controller.vnpayReturn
    );
};
