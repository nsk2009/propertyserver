module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      name: String,
      firstname: String,
      lastname: String,
      username: String,
      password: String,
      designation: String,
      website: String,
      email: String,
      mobile: String,
      city: String,
      country: String,
      zip: String,
      address: String,
      photo: String,
      description: String,
      exportotp:Number,
	    columns: [],
	    privileges: [],
	  role: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "role"
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

  const Adminuser = mongoose.model("adminuser", schema);
  return Adminuser;
};
