const express = require("express");
const { isAuth } = require("../middlewares/auth");
const Post = require("../models/posts.model");

const router = express.Router();

// likes 라우터
router.put('/posts/:id/like',isAuth, async(req, res)=> {

    try {
        const findPost= await Post.findById(req.params.id)
        if(!findPost){
            req.flash("error", "존재하지 않는 게시물입니다")
            res.redirect("back")
        }else{
            // 이미 좋아요를 누른상태라면
            // if(findPost.likes.includes(req.user._id.toString())){
            if(findPost.likes.find(like => like == req.user._id.toString())){
                const updateLikes= findPost.likes.filter(like => like.toString()!== req.user._id.toString())
                // {new: true}: 업데이트된 document를 가져오려면 
                await Post.findByIdAndUpdate(findPost._id, {likes: updateLikes},{new: true})
                console.log("좋아요 업데이트 성공 if ")
            }else{
                // 좋아요를 처음 눌렀을 경우, 누른사용자 좋아요 배열에 추가후 업데이트
                await Post.findByIdAndUpdate(findPost._id,{likes:findPost.likes.concat([req.user._id]) })
                console.log("좋아요 업데이트 성공 else ")
            }
            req.flash("success", "좋아요 업데이트 성공")
            res.redirect("back")
        }
    } catch (error) {
        req.flash("error", "포스트 좋아요중 에러발생")
        res.redirect("back")
    }
})



module.exports = router;
