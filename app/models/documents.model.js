module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		document: String, 
		status: {
			type: String,
			enum : ['Active','Inactive'],
			default: 'Active'
		},
		job: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "jobs"
		},
		quote: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "quotes"
		},
		enquiry:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "enquiry"
		},
		invoice:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "invoices"
		},
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "customer"
		},
		agent:  {
			type: mongoose.Schema.Types.ObjectId,
			ref: "agent"
		},
		tradie:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "tradie"
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

  const Model = mongoose.model("documents", schema);
  return Model;
};
