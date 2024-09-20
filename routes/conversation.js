var express = require("express");
var router = express.Router();
const {
  startConversation,
  fetchConversation,
} = require("../controller/conversation");

router.post("/", startConversation).get("/:userId", fetchConversation);
module.exports = router;
