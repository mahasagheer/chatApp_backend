var express = require("express");
var router = express.Router();
const { userLogin } = require("../controller/login");

router.post("/", userLogin);

module.exports = router;
