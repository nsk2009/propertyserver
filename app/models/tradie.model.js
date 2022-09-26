module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      company:String,
      name:String,
      password: String,
      email: String,
      phone: String,
      abn:String,
      photo:String,
      cost:String,
	  columns: [],
      role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "role"
      },
	  role: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "role"
		},
      service:[],
      location : [],
      businesscertificate : String,
      liabilitycertificate : String,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Declined', 'Trash'],
        default: 'Pending'
      },
      type: {
        type: String,
        enum: ['Admin', 'Staff'],
        default: 'Admin'
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminuser"
      },
      modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminuser"
      },
      tcreatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tradie"
      },
      tmodifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tradie"
      },
    },
    { timestamps: true }
  );

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Model = mongoose.model("tradie", schema);
  return Model;
};
