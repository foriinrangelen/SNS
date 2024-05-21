const express = require("express");
const { isAuth, checkCommentOwnerShip } = require("../middlewares/auth");
const Post = require("../models/posts.model");
const Comment = require("../models/comments.model");
const commentsModel = require("../models/comments.model");
// Router 객체를 생성하면서 mergeParams: true 옵션추가,
// mergeParams: true: 상위 라우터의 req.params값을 하위 라우터의 req.params값에 추가하기위해 사용
// 부모와 자식의 매개변수 이름이 충돌하는경우 자식의 값을 우선
const router = express.Router({
    mergeParams: true
});

// 댓글 작성하면 들어오는 라우터
router.post('/',isAuth, async(req, res)=> {
    try{
        // 포스트가 있는 포스트인지 확인
        let findUser= await Post.findById(req.params.id)
        if(!findUser){
            req.flash("error", "댓글 생성중 오류발생하였거나 댓글 생성중 포스트를 찾지못함");
        }else{
            let newComment= await Comment.create(req.body)
            // 생성한 댓글에 댓글 작성자 아이디&이름 같이 넣어주기
            newComment.author.id=req.user._id
            newComment.author.username=req.user.username
            newComment.save()

            // 포스트에 댓글 데이터 넣어주기
            findUser.comments.push(newComment)
            findUser.save();
            req.flash("success", "댓글이 정상적으로 생성되었습니다");
        }
    }catch(err){
        console.log(err)
        req.flash("error", "댓글 생성중 에러발생");
    }finally{
        res.redirect('back')
    }
})
// 댓글 삭제하는 라우터
router.delete('/:CommentId', checkCommentOwnerShip, async(req, res)=> {
    // 댓글 찾은 후 삭제
    try {
        const deleteComment= await Comment.findByIdAndDelete(req.params.CommentId)
        req.flash("success", "댓글이 정상적으로 삭제되었습니다");
    } catch (error) {
        console.log(error)
        req.flash("error", "댓글 삭제중 에러발생")
    }finally {
        res.redirect('back')
    }
})
// 댓글 수정 페이지를 위한 핸들러
router.get('/:CommentId/edit', checkCommentOwnerShip, async(req, res)=> {
    console.log("123123123213213")
    try {
        // 수정할 게시물 가지고 오기
        // console.log("req.body",req.body)
        let findPost= await Post.findById(req.params.id)
        // console.log("req.comment",req.comment)
        res.render('comments/edit',{
            post: findPost,
            comment: req.comment,
        })
    } catch (error) {
        console.log(error)
        req.flash("error", "댓글 수정중 에러발생")
        res.redirect('back')
    }
})
// 댓글 수정기능 수행하는 핸들러
router.put('/:CommentId',checkCommentOwnerShip, async(req, res)=> {
    // console.log(req.body)
    try{
        let updateComment= await Comment.findByIdAndUpdate(req.params.CommentId, req.body)
        req.flash("success", "댓글 수정성공")
        res.redirect('/posts')
    }catch(err){
        console.log(error)
        req.flash("error", "댓글 수정중 에러발생")
        res.redirect('back')
    }
})
module.exports = router;
