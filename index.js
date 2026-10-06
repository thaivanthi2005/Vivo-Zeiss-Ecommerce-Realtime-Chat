const express = require("express");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
var path = require("path");
require("dotenv").config();
const app = express();
const http = require("http");
const server = http.createServer(app);
const cookieParser = require("cookie-parser");
const route = require("./routes/client/index.route");
const route_admin = require("./routes/admin/index.route");
const database = require("./config/database");
const port = process.env.PORT;
const system_config = require("./config/system");

app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({ extended: false }));

// SocketIO
const { Server } = require("socket.io");
const io = new Server(server);
global._io = io;
// End SocketIO

app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");
app.use(cookieParser());
app.use(
  "/tinymce",
  express.static(path.join(__dirname, "node_modules", "tinymce")),
);
app.use(express.static(`${__dirname}/public`));
app.locals.prefixAdmin = system_config.prefixAdmin;
app.locals.moment = require("moment");
//flash
// ===== SESSION =====
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: true,
  }),
);

// ===== FLASH TỰ VIẾT =====
app.use((req, res, next) => {
  // đưa ra view
  res.locals.success = req.session.success || [];
  res.locals.error = req.session.error || [];

  // clear sau khi đọc
  req.session.success = [];
  req.session.error = [];

  next();
});

//End flash
route(app);
route_admin(app);

database.connect();
app.get("/{*path}", (req, res) => {
  res.status(404).render("client/pages/errors/404", {
    pagetitle: "404 Not Found",
  });
});
app.get('/health', (req, res) => {
     res.status(200).json({ status: 'ok', uptime: process.uptime() });
   });
server.listen(port, () => {
  console.log("kết nối oke");
});
