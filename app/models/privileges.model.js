module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name: String,
      label: String,
	  privileges: String,
    type: {
      type: String,
      enum: ['Tradie', 'Admin'],
    },
	  createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
	  modifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
      status: {
        type: String,
        enum : ['Active','Inactive','Trash'],
        default: 'Active'
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

  const Privileges = mongoose.model("privileges", schema);
  return Privileges;
};
