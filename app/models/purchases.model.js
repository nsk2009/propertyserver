module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		supplier: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "suppliers"
		},
		orderno: String,
		orderdate: String,
		deliverydate: String,
		reference: String,
		doctheme: String,
		linkedbill: String,
		description: String,
		tax: String,
		total: String,
		items: [],
		deliveryaddress: String,
		deliveryinstruct: String,
		notes: [],
		status: {
			type: String,
			enum : ['Active','Inactive','Trash','Draft'],
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

  const Model = mongoose.model("purchases", schema);
  return Model;
};
