const Messages = require("../modal/messages");
const User = require("../modal/user");
const Conversation = require("../modal/conversation");
async function sendMessages(req, res) {
  try {
    const { conversationId, senderId, receiverId, message } = req.body;
    console.log(conversationId, senderId, receiverId, message);
    if (!conversationId || !senderId || !receiverId || !message) {
      res.status(400).json({ msg: "Please fill the required fields" });
    }
    if (conversationId === "new" && receiverId) {
      const newConversation = new Conversation({
        members: [senderId, receiverId],
      });
      const id = newConversation._id;
      console.log(id);
      await newConversation.save();
      const messages = new Messages({
        conversationId: id,
        senderId: senderId,
        receiverId: receiverId,
        message: message,
      });
      await messages.save();
      return res.status(200).json({ msg: "Message sent successfully" });
    } else if (!conversationId && !receiverId) {
      return res.status(400).json({ msg: "Message not send" });
    }
    const messages = new Messages({
      conversationId,
      senderId,
      receiverId,
      message,
    });
    await messages.save();
    return res.status(200).json({ msg: "Message sent successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "Error in sending message" });
  }
}

async function getMessage(req, res) {
  try {
    const checkMessages = async (conversationId) => {
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
            status: user.status,
            receiverId: msg.receiverId,
            message: msg.message,
            createdAt: msg.createdAt,
          };
        })
      );
      res.status(200).json(await messageUserDetail);
    };
    const conversationId = req.params.conversationId;
    const senderId = req.headers.senderid;
    const receiverId = req.headers.receiverid;

    console.log("Sender ID:", senderId);
    console.log("Receiver ID:", receiverId);
    console.log("conversation", conversationId);
    if (conversationId === "new") {
      const checkConversationId = await Conversation.find({
        members: { $all: [senderId, receiverId] },
      });
      if (checkConversationId.length > 0) {
        checkMessages(checkConversationId[0]._id);
      } else {
        return res.status(200).json([]);
      }
    } else {
      checkMessages(conversationId);
    }
  } catch (err) {
    res.status(500).json({ msg: "Error in fetching messages" });
  }
}
module.exports = { sendMessages, getMessage };
