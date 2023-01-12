module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		invoice: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "invoices"
		},
		uid: String,
		xero: String,
		date: Date,
		bank: String,
		amount: Number,
		status: {
			type: String,
			enum: ['Active', 'Trash'],
			default: 'Active'
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

  const Model = mongoose.model("payment", schema);
  return Model;
};
