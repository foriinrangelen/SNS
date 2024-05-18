const mailer = require("nodemailer");
const goodbye = require("./goodbye_template");
const welcome = require("./welcome_template");

const getEmailData = (to, name, template) => {
  let data = null;

  switch (template) {
    case "welcome":
      data = {
        from: "보내는 사람 이름 <userId@gmail.com>",
        // 받는사람 이메일
        to,
        subject: `Hello ${name}`,
        // 타입에맞는 html템플릿 제공
        html: welcome(),
      };
      break;

    case "goodbye":
      data = {
        from: "보내는 사람 이름 <userId@gmail.com>",
        to,
        subject: `Goodbye ${name}`,
        html: goodbye(),
      };
      break;
    default:
      data;
  }

  return data;
};

const sendMail = (to, name, type) => {
  // 가져온 mailer모듈에서 createTransporter메서드에 서비스와 보낼id, password 객체를 매개변수로 전달 후 transporter객체 생성
  const transporter = mailer.createTransporter({
    service: "Gmail",
    auth: {
      user: "kyyyy8629@google.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mail = getEmailData(to, name, type);

  // 생성한 transporter객체는 sendEmail메서드를 제공하고 이 메소드로 메일을 전송할 수 있음
  // sendEmail메서드는 받는사람이메일, 받는사람이름, 타입을 객체를 매개변수로 받고 콜백으로 성공,실패여부 확인
  transporter.sendEmail(mail, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent successfully");
    }
    // 닫아주기
    transporter.close();
  });
};

module.exports = sendMail;
