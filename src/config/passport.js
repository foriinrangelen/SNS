const passport = require("passport");
const User = require("../models/users.model");
// 설치한 passport-local 모듈안의 strategy 가져오기
const localStrategy = require("passport-local").Strategy;
// 설치한 passport-google-oauth20 모듈안의 strategy 가져오기
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// 카카오 가져오기
const KakaoStrategy = require("passport-kakao").Strategy;

// req.login(user) 메서드 실행시 실행되는함수, req.login(user) 내의 user가 serializeUser 메서드로 들어온다
// 이 유저 정보를 이용해서 세션을 생성하고 저장한다
// 이세션데이터를 이용하는 방법은 두가지 방법이있다
// 1. cookie-session: 클라이언트에 세션데이터를 저장해서 이용하는 방식
// 2. express-session: 서버에 세션데이터를 저장해두고 클라이언트에는 세션식별자(session identifer)만 저장해서 이용하는방식
// 본 프로젝트에서는 cookie-session 이용
// 1. Request 요청이들어옴
// 2. 들어온 request요청객체내의 쿠키에서 cookie data추출
// 3. cookie data에서 사용자 아이디 추출
// 4. deserializeUser에서 사용자아이디를 이용해서 데이터베이스의 사용자모든정보 가져오기
// 5. 유저 model의 인스턴스(DB에서 가져온 사용자 모든정보)를 req.user에 저장
// 6. 요청이 route handler로 이동, 사용
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.id);
});

// eserializeUser(): 클라이언트에서 세션데이터를 가지고 request 요청 시 실행되는 메서드
// 유저가 페이지에 들어갈때마다 deserializeUser 메서드가 호출되며 여기에서는 serializeUser에서 사용된 id를 이용해서
// 데이터베이스에서 유저를 찾아 유저의 모든정보를 가져온다
// done(null, user) 은 req.user객체에 들어가서 유저정보를 사용할 수 있게 해준다
// deserializeUser()에 들어가는 첫번째 매개변수 id는 serializeUser에서 사용된 id (id는 passport가 넣어줌)
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

// passport는 기본적으로 username을 사용하지만 현재 프로젝트내의 html에서는 email로 제출하기때문에 usernameField를 수정
// 해주면 콜백의 인자로 email을 받을 수 있다
// 전략 내에서 done이 호출된다면 server.js내의 api의 callback함수가 실행된다
// localStrategy(아이디비밀번호 객체, 콜백함수)
// ❌findOne()도 save()와 마찬가지로 몽구스 5.0부터는 콜백함수를 지원하지 않음❗❗❌
// passport.use(
//   "local",
//   new localStrategy(
//     { usernameField: "email", passwordField: "password" },
//     (email, password, done) => {
//       // User.findOne(이메일, 콜백함수)
//       // 클라이언트로 입력받은 이메일 .toLocaleLowerCase()해서 비교후 콜백실행
//       User.findOne({ email: email.toLocaleLowerCase() }, (err, user) => {
//         // 에러라면 err 리턴해서 api콜백으로 이동
//         if (err) return done(err);
//         // 에러는 아니지만 유저가 없다면 이메일이 없다고 메세지 api콜백으로 이동
//         if (!user) {
//           return done(null, false, { message: `Email ${email} not found` });
//         }

//         // 유저가 있다면 비밀번호 일치하는 지 확인, comparePassword함수는 models/모델파일에서 정의
//         user.comparePassword(password, (err, isMatch) => {
//           // 에러라면 err 리턴해서 api콜백으로 이동
//           if (err) return done(err);
//           // 비밀번호가 틀리다면 메세지와함께 false리턴
//           if (!isMatch) {
//             return done(null, false, { message: `Invalid email & password` });
//           }
//           // 비밀번호가 일치한다면 일치한 user객체 return
//           return done(null, user);
//         });
//       });
//     }
//   )
// );
// prettier-ignore
// 설정으로 변경 후 밑에서 passport.use("local", localStrategyConfig);
const localStrategyConfig= new localStrategy({ usernameField: "email", passwordField: "password" }, 
    async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLocaleLowerCase() });

      if (!user) {
        return done(null, false, { message: `Email ${email} not found.` });
      }
      
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return done(null, false, { message: `Invalid email & password.` });
      }
      console.log("user생성? : ", user);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
passport.use("local", localStrategyConfig);
// ------------------------------------------------------------------------------------------
// google passport 전략
// 구글 전략 설정
const GoogleStrategyConfig = new GoogleStrategy(
  {
    // 생성할때 받은 id 시크릿키, 리다이렉트 uri 입력
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    // 무엇을 받아올건지 scope로 정의
    scope: ["email", "profile"],
  },
  // 그전에 구글에서 '/auth/google/callback'로 권한 부여 후 엑세스 코드와 함께 콜백주소로 리다이렉션 시켜서
  // 한번 더 요청을 보내서 accessToken, refreshToken, profile 을 받아옴
  // accessToken, refreshToken, profile을 콜백으로 받아오기
  async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    // 아이디를 가져와서 이미 가입된 유저인지 확인
    try {
      const user = await User.findOne({ googleId: profile.id });
      // 이미 DB에 존재한다면(가입한 유저라면) user정보 return 해서 done으로 api 콜백으로 보내기
      if (user) {
        return done(null, user);
      }
      // DB에 존재하지 않는다면(가입하지 않은 유저라면) 새로운 유저를 생성해서 user정보 return 해서 done으로 api 콜백으로 보내기
      const newUser = await new User({
        email: profile.emails[0].value,
        // 유저필드에 들어갈값 추가(구글에서 제공해주는값)
        username: profile.displayName,
        firstName: profile.givenName,
        lastName: profile.familyName,
        googleId: profile.id,
      }).save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
);
passport.use("google", GoogleStrategyConfig);

// 카카오 passport 전략 생성하기
const KakaoStrategyConfig = new KakaoStrategy(
  {
    // 카카오 플랫폼에서 생성한 RESTapi키, 리다이렉트 uri 입력
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback",
  },
  // 구글 전략 흐름과 동일
  // accessToken, refreshToken, profile을 콜백으로 받아오기
  async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    // 아이디를 가져와서 이미 가입된 유저인지 확인
    try {
      const user = await User.findOne({ kakaoId: profile.id });
      // 이미 DB에 존재한다면(가입한 유저라면) user정보 return 해서 done으로 api 콜백으로 보내기
      if (user) {
        return done(null, user);
      }
      // DB에 존재하지 않는다면(가입하지 않은 유저라면) 새로운 유저를 생성해서 user정보 return 해서 done으로 api 콜백으로 보내기
      const newUser = await new User({
        kakaoId: profile.id,
        email: profile._json.kakao_account.email,
      }).save();
      return done(null, newUser);
    } catch (err) {
      return done(err);
    }
  }
);
passport.use("kakao", KakaoStrategyConfig);
