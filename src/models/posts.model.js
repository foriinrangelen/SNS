const { default: mongoose } = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    description: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    // 'comments' 필드는 여러 개의 Comment 모델 문서들을 참조할 수 있는 배열입니다.
    // 각 Comment는 MongoDB에서 제공하는 고유 식별자인 ObjectId를 사용하여 참조됩니다.
    // 'ref' 옵션은 해당 ObjectId가 참조하는 모델이 'Comment'임을 나타냅니다.
    author: { id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, username: String },
    image: { type: String },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
