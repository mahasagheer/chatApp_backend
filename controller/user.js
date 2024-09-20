const User = require("../modal/user");
const bcrypt = require("bcryptjs");

async function addUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
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
module.exports = { addUser };
