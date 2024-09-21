var express = require("express");
var router = express.Router();
const { sendMessages, getMessage } = require("../controller/messages");

router.post("/", sendMessages).get("/:conversationId", getMessage);

module.exports = router;
