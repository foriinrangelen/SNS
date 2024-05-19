const express = require("express");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", isAuth, (req, res) => {
  res.render("posts");
});

module.exports = router;
