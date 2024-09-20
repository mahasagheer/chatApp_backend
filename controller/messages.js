const Messages = require("../modal/messages");
const User = require("../modal/user");
async function sendMessages(req, res) {
  try {
    const { conversationId, senderId, receiverId, message, isSeen } = req.body;
    console.log(req.body);
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
    const message = await Messages.find({ conversationId });
    const messageUserDetail = Promise.all(
      message.map(async (msg) => {
        const user = await User.findById(message.senderId);
        return {
          user: { email: user.email, fullName: user.fullName },
          message: message.message,
        };
      })
    );
    res.status(200).json({ data: messageUserDetail });
  } catch (err) {
    res.status(500).json({ msg: "Error in fetching messages" });
  }
}
module.exports = { sendMessages, getMessage };
