module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
		email: String,
		status: {
			type: String,
			enum : ['Pending','Active','Inactive','Trash'],
			default: 'Pending'
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

  const Tax = mongoose.model("connections", schema);
  return Tax;
};
