const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Messages = mongoose.model("Messages", messageSchema);
module.exports = Messages;
