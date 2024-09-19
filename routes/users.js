var express = require("express");
var router = express.Router();
const { addUser, getUser } = require("../controller/user");

router.post("/", addUser).get("/", getUser);

module.exports = router;
