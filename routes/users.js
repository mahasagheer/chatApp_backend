var express = require("express");
var router = express.Router();
const { addUser, getAllUsers } = require("../controller/user");

router.post("/", addUser).get("/", getAllUsers);

module.exports = router;
