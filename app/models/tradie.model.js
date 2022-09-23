module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      company:String,
      name:String,
      password: String,
      email: String,
      phone: String,
      abn:String,
      service:[],
      location : [],
      businesscertificate : String,
      liabilitycertificate : String,
      status: {
        type: String,
        enum: ['Active', 'Inactive', 'Trash'],
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

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Model = mongoose.model("tradie", schema);
  return Model;
};
