const express = require("express");
const { isAuth } = require("../middlewares/auth");
const User = require("../models/users.model");

const router = express.Router();



// 친구 요청페이지에 들어갔을때
router.get('/', isAuth, async(req, res) => {
    try {
        const findUser= await User.find({})
        res.render("friends",{
            users:findUser,

        })
        } catch (error) {
        req.flash("error", "유저 가져오는데 에러발생");
        res.redirect("/posts");
    }
})

// 친구요청 보내는 핸들러
router.put('/:id/add-friend', isAuth, async(req, res) => {
    try {
        const findUser = await User.findById(req.params.id)
        if (!findUser) {
            req.flash("error", "유저를 찾을 수 없습니다.");
            res.redirect("/friends");
        }else{
            findUser.friendsRequests.push(req.user._id)
            await findUser.save()
            req.flash("success", "친구요청을 보냈습니다.")
            res.redirect("/friends")
        }

    } catch (error) {
        req.flash("error", "친구요청 보내는데 에러발생");
        res.redirect("/friends");
    }
})

// 친구요청취소를 위한 핸들러
router.put('/:firstId/remove-friend-request/:secondId', isAuth, async(req, res)=>{
    try {
        const findUser = await User.findById(req.params.firstId)
        if (!findUser) {
            req.flash("error", "유저를 찾을 수 없습니다.");
            res.redirect("back");
        }else{
            const filteredFriendsRequests= findUser.friendsRequests.filter(friendId=>friendId!== req.params.secondId)
            await User.findByIdAndUpdate(findUser._id, {friendsRequests: filteredFriendsRequests})
            req.flash("success", "친구요청 취소(거절)성공")
            res.redirect("/friends")
        }

    } catch (error) {
        req.flash("error", "친구요청 취소 에러발생");
        res.redirect("/friends");
    }

})

// 친구요청 수락을 위한 핸들러
router.put('/:id/accept-friend-request/', isAuth, async(req,res)=>{
    try {
        const senderUser = await User.findById(req.params.id)
        if (!senderUser) {
            req.flash("error", "유저를 찾을 수 없습니다.");
            res.redirect("back");
        }else{
            // 친구요청보낸사람 친구창에 추가
            await User.findByIdAndUpdate(senderUser._id, {
                friends: senderUser.friends.concat([req.user._id])
                })
            // 친구요청 받은사람 친구창에 추가 및 친구요청리스트 삭제
            await User.findByIdAndUpdate(req.user._id, {
                friends: req.user.friends.concat([senderUser._id]),
                friendsRequests: req.user.friendsRequests.filter(friendId=>friendId!== senderUser._id.toString())
            })
            req.flash("success", "친구요청 수락성공")
            res.redirect("/friends")
        }
        }catch (error) {
            req.flash("error", "친구요청 수락 에러발생");
            res.redirect("back");
}})

// 친구 취소를 위한 핸들러
router.put('/:id/remove-friend', isAuth, async(req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            req.flash("error", "유저를 찾을 수 없습니다.");
            res.redirect("back");
        }else{
            // 친구삭제
            await User.findByIdAndUpdate(user._id, {
                friends: user.friends.filter(friendId=>friendId!== req.user._id.toString())
                })
            // 친구요청 받은사람 친구창에 추가 및 친구요청리스트 삭제
            await User.findByIdAndUpdate(req.user._id, {
                friends: req.user.friends.filter(friendId=>friendId!== user._id.toString())
                
            })
            req.flash("success", "친구삭제 성공")
            res.redirect("/friends")
        }
        }catch (error) {
            req.flash("error", "친구삭제 중 에러발생");
            res.redirect("back");
        }
})


module.exports = router;
