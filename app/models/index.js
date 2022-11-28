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
db.customer = require("./customer.model.js")(mongoose, mongoosePaginate);
db.agent = require("./agent.model.js")(mongoose, mongoosePaginate);
db.enquiry = require("./enquiry.model.js")(mongoose, mongoosePaginate);
db.taxes = require("./taxes.model.js")(mongoose, mongoosePaginate);
db.quotes = require("./quotes.model.js")(mongoose, mongoosePaginate);
db.invoices = require("./invoices.model.js")(mongoose, mongoosePaginate);
db.jobs = require("./jobs.model.js")(mongoose, mongoosePaginate);
db.tradie = require("./tradie.model.js")(mongoose, mongoosePaginate);
db.accountingapis = require("./accountingapi.model.js")(mongoose, mongoosePaginate);
db.inbox = require("./inbox.model.js")(mongoose, mongoosePaginate);
db.notes = require("./notes.model.js")(mongoose, mongoosePaginate);
db.mailbox = require("./mailbox.model.js")(mongoose, mongoosePaginate);
db.tenant = require("./tenant.model.js")(mongoose, mongoosePaginate);

module.exports = db;
