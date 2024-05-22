// isAuthenticated(): passport에서 제공해주는 메서드이고 로그인세션데이터가 존재한다면 true, 안되있다면 false를 리턴
// 세션은passport.serializeUser에서 생성된다
const Post= require("../models/posts.model");
const Comment= require("../models/comments.model");
const User= require("../models/users.model");
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

// 로그인한 사용자가 포스트주인인지, 게시물이 존재하는지 확인하는 함수
async function checkPostOwnerShip(req, res, next) {
  if (req.isAuthenticated()) {
    // id에 맞는 포스트가 있는 포스트인지
    try{
      // console.log("eq.params.id",req.params.id)
      const findPost= await Post.findById(req.params.id)
      // console.log("findPost.author.id",findPost.author.id)
      if(!findPost){
        req.flash("error", "존재하지 않는 게시물입니다✅");
        res.redirect("back");
        
      }else{
        // 포스트가 있는데 나의 포스트인지 확인
        // console.log("findPost.author",findPost)
        if(findPost.author.id.equals(req.user._id)){
          // 게시물 데이터 라우터로 넘겨주기
          req.post= findPost;
          next();
        }else{
          req.flash("error", "권한이 없습니다");
          res.redirect("back");
        }
      }
    }catch(err){
      console.log(err);
      req.flash("error", "존재하지 않는 게시물입니다✅✅");
      res.redirect("back");
    }

  }else{
    req.flash("error", "로그인이 필요합니다");
    res.redirect("/login");
  }
}
// 로그인한 사용자가 댓글주인인지, 댓글이 존재하는지 확인하는 함수
async function checkCommentOwnerShip(req, res, next) {
  if(req.isAuthenticated()){
    try{
      let findComment= await Comment.findById(req.params.CommentId)
      if(!findComment){
        req.flash("error", "존재하지 않는 댓글입니다");
        // res.redirect("back");
      }else{
        // 내가 작성한 댓글인지
        if(findComment.author.id.equals(req.user._id)){
          // 게시물 댓글 데이터 라우터로 넘겨주기
          req.comment= findComment;
          // 맞다면 넘어가기
            next();
        }else{
          req.flash("error", "권한이 없습니다");
          res.redirect("back");
        }
      }
    }catch(err){
      req.flash("error", "댓글 찾는도중 에러발생");
      res.redirect("back");
    }


  }else{
    req.flash("error", "로그인이 필요합니다");
    res.redirect("/login");
  }
}

// 프로필페이지에서 프로필수정을 버튼사람이 자신인지 확인하는 미들웨어
async function checkIsMe(req,res,next){
  try {
  if(req.isAuthenticated()){
    const findUser= await User.findById(req.params.id)
    if(!findUser){
      req.flash("error", "유저가 존재하지 않습니다");
      res.redirect("/profile/"+req.params.id);
      }else{
        if(findUser._id.equals(req.user._id)){
          next();
        }else{
          req.flash("error", "권한이 없습니다");
          res.redirect("/profile/"+req.params.id);
        }
      }
      
    }
  else{
    req.flash("error", "로그인이 필요합니다");
    res.redirect("/login");
  }
} catch (error) {
  req.flash("error", "유저 확인도중 에러발생");
  res.redirect("/profile/"+req.params.id);
}}



module.exports = { isAuth, isNotAuth, checkPostOwnerShip, checkCommentOwnerShip, checkIsMe };
