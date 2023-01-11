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
      morgintype:String,
      uid:String, 
      property: String,
      tradie: String,
      cost:String,
	  columns: [],
      accname:String,
      accnum:String,
      bsbcode:String,
      notes:String,	  
      gst: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes'
      },
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
        enum: ['Active', 'Approved', 'Declined', 'Trash'],
        default: 'Active'
      },
		sent: {
			type: Number,
			enum : [0, 1],
			default: 0
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
