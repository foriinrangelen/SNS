const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// 스키마 생성
const userSchema = new mongoose.Schema(
  {
    email: {
      // 타입지정
      type: String,
      // 똑같은 이메일 사용하지못하게 (유효성 체크)
      unique: true,
    },
    password: {
      type: String,
      // 비밀번호는 최소 5자리 이상으로 설정 (유효성 체크)
      minLength: 5,
    },
    googleId: {
      type: String,
      unique: true,
      // sparse: true,: sparse index라고하고
      // 기본적으로 email, password를 이용한 로그인 하나(로컬 로그인)와 googleId를 이용한 로그인 두가지를 구현하는데
      // 로컬로그인시 구글로그인 필드는 null, 다시 구글로그인을 하고 다시 로컬로그인을 실행하면 구글아이디는 다시 null값이 들어오게되서
      // googleId 의 unique에 제약이 걸리기때문에(에러발생) 방지하기 위해 사용
      sparse: true,
    },
    kakaoId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // sns 위한 필드 추가하기
    username: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      default: "First Name",
    },
    lastName: {
      type: String,
      default: "Last Name",
    },
    bio: {
      type: String,
      default: "데이터 없음",
    },
    hometown: {
      type: String,
      default: "데이터 없음",
    },
    workspace: {
      type: String,
      default: "데이터 없음",
    },
    education: {
      type: String,
      default: "데이터 없음",
    },
    contact: {
      type: String,
      default: "데이터 없음",
    },
    friends: [{ type: String }],

    friendsRequests: [{ type: String }],
  },
  // collection 안에 데이터가 들어갈때 자동으로 시간추가
  { timestamps: true }
);
// salt길이 설정
const saltRounds = 10;
// pre(): save()이전에 실행될 메서드 정의하기- 비밀번호 salt+hash화 하기
userSchema.pre("save", function (next) {
  let user = this; // 여기서 this란 그때 당시에 생성된 user객체
  // isModified(): 해당 스키마의 속성이 변경되었는지 확인하는 메서드, 여기서는 비밀번호를 입력받으면 변경된거니 true값을 리턴
  if (user.isModified("password")) {
    // getSalt()메서드로 salt생성
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);
      // bcrypt 의 hash메서드로 salt+user.password로 해시화된 비밀번호 생성
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        // 현재 유저 인스턴스 패스워드에 hash된값 담기
        user.password = hash;
        // 다시 실행되기전의 save()로 이동
        next();
      });
    });
    // 구글 로그인등 소셜로그인시에는 비밀번호를 입력받지않기때문에 여기에서 멈춰버림
  } else {
    next();
  }
});
userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    // bcrypt.compare()는 Promise를 반환하므로 await
    // plainPassword와 this.password를 비교한 후, 결과로 boolean 값을 반환
    // plainPassword: 사용자에 입력받은 평문 password
    // this.password: mongoose 모델 인스턴스의 패스워드(이미 salt+해시화된 비밀번호)
    // this는 함수가 호출될때 결정되기때문에 comparePassword()메서드가 호출될때에는 findOne해서 찾아온 유저인스턴스를 가리킴
    console.log("plainPassword : " + plainPassword);
    console.log("this.password : " + this.password);
    console.log("this : " + this);
    const isMatch = await bcrypt.compare(plainPassword, this.password);
    return isMatch;
  } catch (err) {
    console.log(err); // 또는 필요에 따라 다른 방식으로 오류를 처리할 수 있습니다.
  }
};
// userSchema.methods.comparePassword = function (plainPassword) {
//   return new Promise((resolve, reject) => {
//     // bcryptjs모듈의 compare()메서드로 this.password와 salt+해시화된 비밀번호를 비교하기
//     // plainPassword: 사용자에 입력받은 평문 password
//     // this.password: mongoose 모델 인스턴스의 패스워드(이미 salt+해시화된 비밀번호)
//     // this는 함수가 호출될때 결정되기때문에 comparePassword()메서드가 호출될때에는 findOne해서 찾아온 유저인스턴스를 가리킴
//     bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
//       if (err) reject(err);
//       else resolve(isMatch);
//     });
//   });
// };

// comparePassword
// userSchema.methods.comparePassword = function (plainPassword, callback) {
//   // 원래라면 bcrypt 모듈을 활용하여 compare 비교해야함 임시대기
//   // plainPassword => 클라이언트에서 온 password, this.password는 DB에 있는 비밀번호가 담김
//   // comparePassword의 두번째 매개변수인 콜백은 전략에서 사용되고있는 comparePassword의 두번째 매개변수 콜백으로 이동한다
//   // 같은함수임, 정의를 모델에서 한거
//   console.log("plainPassword : ", plainPassword);
//   console.log("this.password : ", this.password);
//   if (plainPassword === this.password) {
//     // 비밀번호가 일치한다면 callback함수의 두번째 인자로 true 담기
//     callback(null, true);
//   } else {
//     // 틀리면 false담기
//     callback(null, false);
//   }
//   // 에러면 콜백첫번재인자로 에러담긴 객체 리턴
//   return callback({ error: "error" });
// };

// 모델은 스키마를 사용하여 실제 데이터베이스 작업을 수행하는 메서드를 제공하는 객체
const User = mongoose.model("User", userSchema);

module.exports = User;

// 스키마와 모델의 차이?
//스키마는 데이터베이스에서 사용될 문서의 구조를 정의합니다.
//모델은 스키마를 기반으로 생성되며, 실제 데이터베이스 작업을 수행하는 메서드를 제공합니다.
//스키마가 데이터의 "청사진"이라면, 모델은 그 청사진을 바탕으로 실제 건물을 짓고 관리하는 역할을 하는 것으로 볼 수 있습니다.
