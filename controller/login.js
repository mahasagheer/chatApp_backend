const User = require("../modal/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please fill required fields" });
    } else {
      const findUser = await User.findOne({ email: email });
      if (!findUser) {
        return res
          .status(400)
          .json({ msg: "User with this email don't not exist" });
      } else {
        const validateUser = await bcrypt.compare(password, findUser.password);
        if (!validateUser) {
          return res.status(400).json({ msg: "Invalid credentials" });
        } else {
          const payload = {
            userId: findUser._id,
            email: findUser.email,
          };
          const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "$#DAN4545";
          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 84600 },
            async (err, token) => {
              await User.updateOne(
                { _id: findUser._id },
                {
                  $set: { token: token, status: true },
                }
              );
              findUser.save();
            }
          );
          return res.status(200).json({
            msg: "User Login Successfully",
            data: {
              fullName: findUser.fullName,
              email: findUser.email,
            },
            token: findUser.token,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({ msg: "Error in login" });
  }
}
module.exports = { userLogin };
