const { Email } = require("@mui/icons-material");
const Conversation = require("../modal/conversation");
const User = require("../modal/user");
async function startConversation(req, res) {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ msg: "Please fill required Fields" });
    }
    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });
    await newConversation.save();
    return res.status(200).json({ msg: "Conversation created successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error in creating new conversation" });
  }
}
async function fetchConversation(req, res) {
  try {
    const userId = req.params.userId;
    const getConversation = await Conversation.find({
      members: { $in: [userId] },
    });
    if (!getConversation) {
      return res.status(400).json({ msg: "Conversation does not exist" });
    } else {
      const userDetailConversation = Promise.all(
        getConversation.map(async (conversation) => {
          const receiverId = conversation.members.find(
            (member) => member !== userId
          );
          const user = await User.findById(receiverId);
          return res.status(200).json({
            msg: "Conversation fetched successfully",
            conversationId: conversation._id,
            receiverId: receiverId,
            fullName: user.fullName,
            email: user.email,
            status: user.status,
          });
        })
      );
    }
  } catch (err) {
    return res
      .status(500)
      .json({ msg: "Error in fetching Conversation from Database" });
  }
}
module.exports = { startConversation, fetchConversation };
