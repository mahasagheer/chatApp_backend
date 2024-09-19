const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: Number,
      required: true,
    },
    content: {
      body: { type: String, required: true },
      status: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Messages = mongoose.model("messages", messageSchema);
module.exports = Messages;
