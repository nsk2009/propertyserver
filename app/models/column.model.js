module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name: String,
	  columns: [],
	  createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
	  modifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "adminuser"
		},
      type: {
        type: String,
        enum : ['Admin','Tradie'],
        default: 'Admin'
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

  const Columns = mongoose.model("columns", schema);
  return Columns;
};
