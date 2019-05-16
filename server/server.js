const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// start express instance
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.Promise = global.Promise;
// use mongoose to connec to my db.
// use then to display promise
// catch to display errors
mongoose
  .connect(process.env.DATABASE, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to MongodDb");
  })
  .catch(err => {
    console.log(err);
  });
mongoose.set("useCreateIndex", true);

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
const { auth } = require("./middleware/auth");
const { admin } = require("./middleware/admin");

// Models

// Bring in User models
const { User } = require("./models/user");

// bring in Brand Models
const { Brand } = require("./models/brand");

// bring in Wood Models
const { Wood } = require("./models/wood");

// bring in Product Models
const { Product } = require("./models/product");

// =====================PRODUCTs==================

// fetch product by ARRIVAL
// /articles?sortBy=createdAt&order=desc&limit=4

// fetch products by sell
// /articles?sortBy=sold&order=desc&limit=4
app.get("/api/product/articles", (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 100;

  Product.find()
    .populate("brand")
    .populate("wood")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, articles) => {
      if (err) return res.status(400).send(err);
      res.send(articles);
    });
});

// fetch product from db by ID
app.get("/api/product/articles_by_id", (req, res) => {
  let type = req.query.type;
  let items = req.query.id;

  if (type === "array") {
    let ids = req.query.id.split(",");
    items = [];
    items = ids.map(item => {
      return mongoose.Types.ObjectId(item);
    });
  }

  Product.find({ _id: { $in: items } })
    .populate("brand")
    .populate("wood")
    .exec((err, docs) => {
      return res.status(200).send(docs);
    });
});

// posting product to db
app.post("/api/product/article", auth, admin, (req, res) => {
  const product = new Product(req.body);

  product.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({
      success: true,
      article: doc
    });
  });
});

// =====================WOOD==================

app.post("/api/product/wood", auth, admin, (req, res) => {
  const wood = new Wood(req.body);

  wood.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({
      success: true,
      wood: doc
    });
  });
});

app.get("/api/product/woods", (req, res) => {
  Wood.find({}, (err, woods) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(woods);
  });
});

// =====================BRAND==================

// send brand to db
app.post("/api/product/brand", auth, admin, (req, res) => {
  const brand = new Brand(req.body);

  brand.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({
      success: true,
      brand: doc
    });
  });
});

// fetch brands from db
app.get("/api/product/brands", (req, res) => {
  Brand.find({}, (err, brands) => {
    if (err) return res.status(400).send(err);
    res.status(200).send(brands);
  });
});

// =====================USERS==================

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    cart: req.user.cart,
    history: req.user.history
  });
});

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    res.status(200).json({
      success: true
      // userData: doc
    });
  });
});

// Login routes
app.post("/api/users/login", (req, res) => {
  // find the email
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSuccess: false,
        message: "Auth failes, email not found"
      });

    // check password
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({ loginSuccess: false, message: "Wrong password" });
      }

      // generate a token
      user.generateToken(err => {
        if (err) {
          return res.status(400).send(err);
        }
        // store token as a cookie
        res
          .cookie("w_auth", user.token)
          .status(200)
          .json({
            loginSuccess: true
          });
      });
    });
  });
});

// logout routes
app.get("/api/user/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, doc) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).send({
      success: true
    });
  });
});

// run port on process or 5000
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
