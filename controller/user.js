const User = require("../modal/user");
async function addUser(req, res) {
  try {
    let newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });

    res.status(201).json({ msg: "success", user: newUser._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Unable to create user" });
  }
}
async function getUser(req, res) {
  try {
    const user = User.findOne({ email: "mahasagheer960@gmail.com" });
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(400).json({ msg: "Unable to get user" });
  }
}
module.exports = { addUser, getUser };
