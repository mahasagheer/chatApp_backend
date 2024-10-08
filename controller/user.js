const User = require("../modal/user");
const bcrypt = require("bcryptjs");

async function addUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const profilePic = req.file.filename;
    if (!fullName || !email || !password) {
      res.status(400).json({ msg: "Please fill required fields" });
    } else {
      const isAlreadyExist = await User.findOne({ email: email });
      if (isAlreadyExist) {
        res.status(400).json({ msg: "User already exist" });
      } else {
        const newUser = await User({
          fullName: fullName,
          email: email,
          profilePic: profilePic,
        });
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          newUser.set("password", hashedPassword);
          newUser.save();
        });
        res
          .status(200)
          .json({ msg: "User added successfully", user: newUser._id });
      }
    }
  } catch (err) {
    res.status(500).json({ msg: "Unable to create user" });
  }
}

async function getAllUsers(req, res) {
  try {
    const userId = req.params.userId;
    const users = await User.find({ _id: { $ne: userId } });
    const user = Promise.all(
      users.map(async (userData) => {
        return {
          email: userData.email,
          fullName: userData.fullName,
          userId: userData._id,
          status: userData.status,
          profilePic: userData.profilePic,
        };
      })
    );
    return res.status(200).json(await user);
  } catch (err) {
    return res.status(500).json({ msg: "Error in fetching all users" });
  }
}
module.exports = { addUser, getAllUsers };
