const dbConfig = require("../config/db.config.js");

const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.adminusers = require("./adminuser.model.js")(mongoose, mongoosePaginate);
db.settings = require("./setting.model.js")(mongoose, mongoosePaginate);
db.dateformat = require("./dateformat.model.js")(mongoose, mongoosePaginate);
db.timezone = require("./timezone.model.js")(mongoose, mongoosePaginate);
db.role = require("./role.model.js")(mongoose, mongoosePaginate);
db.privileges = require("./privileges.model.js")(mongoose, mongoosePaginate);
db.columns = require("./column.model.js")(mongoose, mongoosePaginate);
db.messages = require("./message.model.js")(mongoose, mongoosePaginate);
db.emailapi = require("./emailapi.model.js")(mongoose, mongoosePaginate);
db.emailnotification = require("./emailnotification.model.js")(mongoose, mongoosePaginate);
db.imports = require("./imports.model.js")(mongoose, mongoosePaginate);
db.customer = require("./customer.model.js")(mongoose, mongoosePaginate);
db.usa_states = require("./usa_states.model.js")(mongoose, mongoosePaginate);
db.usa_cities = require("./usa_cities.model.js")(mongoose, mongoosePaginate);

module.exports = db;
