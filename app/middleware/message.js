const db = require("../models");
const Message = db.messages;
const message = async(page) => {		
	var ms = await Message.findOne({ name: page}).then();
	return ms;
};

module.exports = message;
