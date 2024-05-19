// isAuthenticated(): passport에서 제공해주는 메서드이고 로그인세션데이터가 존재한다면 true, 안되있다면 false를 리턴
// 세션은passport.serializeUser에서 생성된다

function isAuth(req, res, next) {
  // console.log(req.isAuthenticated());
  // console.log(req.user, req.isAuthenticated());
  if (req.isAuthenticated()) {
    return next();
  }
  // console.log("?????????");
  res.redirect("/login");
}

function isNotAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/posts");
}

module.exports = { isAuth, isNotAuth };
