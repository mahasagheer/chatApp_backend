const Messages = require("../modal/messages");
const User = require("../modal/user");
const Conversation = require("../modal/conversation");
async function sendMessages(req, res) {
  try {
    const { conversationId, senderId, receiverId, message, isSeen } = req.body;
    if (!conversationId || !senderId || !receiverId || !message) {
      res.status(400).json({ msg: "Please fill the required fields" });
    }
    if (!conversationId && !receiverId) {
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const messages = new Messages({
        conversationId,
        senderId,
        receiverId,
        message,
        isSeen,
      });
      await messages.save();
      return res.status(200).json({ msg: "Message sent successfully" });
    }
    const messages = new Messages({
      conversationId,
      senderId,
      receiverId,
      message,
      isSeen,
    });
    await messages.save();
    return res.status(200).json({ msg: "Message sent successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Error in sending message" });
  }
}

async function getMessage(req, res) {
  try {
    const conversationId = req.params.conversationId;
    if (!conversationId === "new") {
      return res.status(200).json([]);
    }
    const message = await Messages.find({ conversationId: conversationId });
    const messageUserDetail = Promise.all(
      message.map(async (msg) => {
        const user = await User.findById(msg.senderId);
        return {
          user: {
            userId: user._id,
            email: user.email,
            fullName: user.fullName,
          },
          receiverId: msg.receiverId,
          message: msg.message,
          createdAt: msg.createdAt,
        };
      })
    );
    console.log(messageUserDetail);
    res.status(200).json(await messageUserDetail);
  } catch (err) {
    res.status(500).json({ msg: "Error in fetching messages" });
  }
}
module.exports = { sendMessages, getMessage };
