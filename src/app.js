const dotenv = require("dotenv");
const mongoose = require("mongoose");
const twitterBot = require("./bots/twitterPost");

dotenv.config();

twitterBot.postNews();
//twitterBot.saveTest();



