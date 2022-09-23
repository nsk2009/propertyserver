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
db.enquiry = require("./enquiry.model.js")(mongoose, mongoosePaginate);
db.suppliers = require("./suppliers.model.js")(mongoose, mongoosePaginate);
db.categories = require("./categories.model.js")(mongoose, mongoosePaginate);
db.products = require("./products.model.js")(mongoose, mongoosePaginate);
db.billingrates = require("./billingrates.model.js")(mongoose, mongoosePaginate);
db.taxes = require("./taxes.model.js")(mongoose, mongoosePaginate);
db.kits = require("./kits.model.js")(mongoose, mongoosePaginate);
db.purchases = require("./purchases.model.js")(mongoose, mongoosePaginate);
db.quotes = require("./quotes.model.js")(mongoose, mongoosePaginate);
db.invoices = require("./invoices.model.js")(mongoose, mongoosePaginate);
db.jobs = require("./jobs.model.js")(mongoose, mongoosePaginate);
db.connections = require("./connections.model.js")(mongoose, mongoosePaginate);
db.docthemes = require("./docthemes.model.js")(mongoose, mongoosePaginate);
db.tradie = require("./tradie.model.js")(mongoose, mongoosePaginate);

module.exports = db;
