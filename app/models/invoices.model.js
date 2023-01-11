module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		quote: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quotes"
		},
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "customer"
		},
		agent:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "agent"
		},
		tenant:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tenant"
		},
		tradie: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
		},
		job: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "jobs"
		},
		uid:String,
		title:String,
		contact: Array,
		subtotal: Number,
		grosstotal: String,
		discamt: Number,
		taxamt: Number,
		total: Number,
		discount: String, 
		distype: String,
		taxrate: String,
		taxtype: String,
		issuedate: Date,
		duedate: Date,
		terms: String,
		xero: String,
		taxid:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "taxes"
		},
		sent: {
			type: Number,
			enum : [0, 1],
			default: 0
		}, 
		due: {
			type: Number,
			default: 0
		}, 
		paid: {
			type: Number,
			default: 0
		}, 
		taxname: String,
		tax: String,
		items: Array,
		description: String,
		usertype: {
			type: String,
			enum : ['customer','agent'],
			default: 'customer'
		}, 	
		status: {
			type: String,
			enum : ['Draft','Awaiting Payment','Overdue','Completed'],
			default: 'Draft'
		}, 	
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
		modifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
    },
	{ timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Model = mongoose.model("invoices", schema);
  return Model;
};
