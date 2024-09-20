var express = require("express");
var router = express.Router();
const { sendMessages } = require("../controller/messages");

router.post("/", sendMessages);

module.exports = router;
