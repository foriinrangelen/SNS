const express = require("express");
const { isAuth, isNotAuth } = require("../middlewares/auth");

const mainRouter = express.Router();

// isAuth: 로그인이 되있는지 확인하는 함수 로그인이 되어있다면 next(), 안되있다면 로그인페이지로 리다이렉트
mainRouter.get("/", isAuth, (req, res, next) => {
  res.render("index");
});

// /login 요청시 로그인페이지로 이동
// isNotAuth: 로그인이 되어있다면 루트페이지로 리다이렉트 안되있다면 진행
mainRouter.get("/login", isNotAuth, (req, res) => {
  res.render("auth/login");
});

// /signup 요청시 회원가입 페이지로 이동
mainRouter.get("/signup", isNotAuth, (req, res) => {
  res.render("auth/signup");
});

module.exports = mainRouter;
