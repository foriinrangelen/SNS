const express = require("express");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");
const multer = require("multer");
const path = require("path");
// multer라이브러리 활용한 이미지업로드 설정하기
const storageEngine = multer.diskStorage({
  // destination: 어디에 저장할건지
  // 들어가는 함수의 파라미터로 콜백으로 설정
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/assets/images"));
  },
  // filename: 어떤이름으로 저장할건지
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
// multer storage 설정
const upload = multer({ storage: storageEngine }).single("image"); //single()은 제줄한 폼의 id를 받는다
// multer가 req에 file을 만들어줘서 거기에 넣어준다
router.post("/", isAuth, upload, async (req, res, next) => {
  let desc = req.body.desc;
  // 파일이름 가져오기, 이미지를 넣을수도 있고 넣지 않을수도 있기때문에
  let image = req.file ? req.file.filename : "";

  // db저장
  try {
    await Post.create({
      description: desc,
      image: image,
      author: {
        id: req.user._id,
        username: req.user.username,
      },
    });
    res.redirect("back"); // 도 가능
    // res.redirect("/posts");
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/", isAuth, async (req, res) => {
  try {
    // post cllection의 모든 데이터 가져와서, 조회된 문서 내의 특정 필드(comments라는 필드)에 연결된 다른 문서들을 함께 조회, 이후 createdAt기준으로
    // 내림차순 정렬(최근문서부터 가져오기)

    const posts = await Post.find().populate("comments").sort({ createdAt: -1 }).exec();
    // console.log(posts)
    res.render("posts", {
      posts: posts,
      currentUser: req.user,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
