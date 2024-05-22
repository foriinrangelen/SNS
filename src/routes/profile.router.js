const express = require("express");
const { isAuth, checkIsMe } = require("../middlewares/auth");
const Post = require("../models/posts.model");
const User = require("../models/users.model");
const router = express.Router({
    mergeParams: true,
});

// 자기 프로필페이지 조회핸들러
router.get("/", isAuth, async(req, res) => {
    try {
        // 작성자 이름으로 댓글까지 전부 가져오고 정렬후 실행
        const findPost= await Post.find({ "author.id": req.params.id }).populate("comments").sort({createdAt:-1}).exec()
        if(!findPost){
            req.flash("error", "없는 작성자입니다");
            res.redirect("back");
        }else{
            // 작성자 프로필 데이터 가져오기
            const findUser= await User.findById(req.params.id)
            res.render("profile",{
                posts:findPost,
                user:findUser,
            })
        }
    } catch (error) {
        console.log(error)
        req.flash("error", "포스트 가져오는 중 에러발생");
        res.redirect("back");
    }

})

// 프로필 수정 페이지 이동 핸들러, checkIsMe로 유효성 검사를 거친다
router.get("/edit", checkIsMe, async(req, res) => {
    res.render("profile/edit",{
        user: req.user
    })
})
// 프로필 수정버튼 클릭시 로직수행 핸들러
router.put("/", checkIsMe, async(req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            // runValidators: true: 스키마에 정의된 유효성 검사를 실시할때
            // runValidators: true,
        });
        if (!user) {
            req.flash("error", "유저 업데이트 수정 실패");
            res.redirect("back");
        } else {
            req.flash("success", "프로필 업데이트 성공");
            res.redirect('/profile/'+ req.params.id);
        }
    } catch (error) {
        console.log(error);
        req.flash("error", "수정 실패 에러발생");
        res.redirect("back");
    }
})



module.exports = router;
