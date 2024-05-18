const express = require("express");
const { isAuth, isNotAuth } = require("../middlewares/auth");
const passport = require("passport");
const User = require("../models/users.model");
const usersRouter = express.Router();

usersRouter.post("/login", (req, res, next) => {
  // 로컬 로그인전략을 사용하기때문에 passport모듈의 authenticate 메서드를 사용해서 "local"
  // authenticate() : 전략 불러오는 메서드
  // done 호출시 authenticate메서드 두번째 매개변수 콜백실행
  // console.log("222222222222222222");
  passport.authenticate("local", (err, user, info) => {
    // done에 null이 담겨왔다면(에러발생) 담겨 왔다면 express 에러처리기로 이동(next)
    if (err) return next(err);
    // done에 user가 없고 info가 담겨왔다면(아이디가 틀렸거나 비밀번호가 틀렸거나)
    if (!user) return res.json({ message: info });
    // 정상적으로 일치했을시 passport에서 제공해주는 req.login()메서드 실행
    // req.login(): 사용자세션을 수립하기위해 사용, 아래 과정을 통해 user 객체 정보가req.user에 할당된다
    // 1. passport.serializer() 함수로 이동
    console.log("req.login 들어가기전 user:", user);
    req.logIn(user, (err) => {
      // 에러 발생시 에러처리기로 이동
      if (err) return next(err);
      // 로그인 성공시 루트페이지로 이동
      res.redirect("/");
    });
  })(req, res, next); // 미들웨어 안의 미들웨어를 호출하려면 ()을붙여 호출을 추가로 해줘야하고 안에 req,res,next 매개변수도 넣어줘야한다
});
// 로그아웃버튼 클릭시
usersRouter.post("/logout", (req, res, next) => {
  // req.logout(): passport에서 제공하는 메서드로,사용자 세션을 종료시키는 함수
  req.logOut((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// /signup 페이지에서 아이디,비밀번호 입력 후 요청시(post)
usersRouter.post("/signup", async (req, res) => {
  // 1.유저 객체 생성하기
  const user = new User(req.body);
  //   console.log(req.body);
  //   console.log(user);
  // 2. user collection에 저장하기(RDB에서는 Table)
  try {
    // 2-1. 정상적으로 저장 시
    await user.save();
    // 회원가입한 유저에게 메일 보내기 임시주석
    // sendMail('받는사람 이메일', '받는사람이름', '타입');
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

// login.ejs에서 구글로그인을 눌렀을시 실행될 api, 구글 passport 전략이 실행된다
usersRouter.get("/google", passport.authenticate("google"));
// 구글에서 콜백시켜서 오는 api엔드포인트
// prettier-ignore
usersRouter.get("/google/callback", passport.authenticate("google", {
    // 성공했을 시 이동할 주소
    successReturnToOrRedirect: "/",
    // 실패 시 이동할 주소
    failureRedirect: "/login",
  })
);
// login.ejs에서 카카오로그인을 눌렀을시 실행될 api, 카카오 passport 전략이 실행된다
usersRouter.get("/kakao", passport.authenticate("kakao"));
// 카카오에서 콜백시켜서 오는 api엔드포인트
// prettier-ignore
usersRouter.get("/kakao/callback", passport.authenticate("kakao", {
  // 성공했을 시 이동할 주소
  successReturnToOrRedirect: "/",
  // 실패 시 이동할 주소
  failureRedirect: "/login",
})
);

module.exports = usersRouter;
