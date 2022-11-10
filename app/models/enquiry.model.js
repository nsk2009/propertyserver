module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      title:String,
      name:String,
      company:String, 
      email: String,
      uid:String,
      phone: String,
      address : Array,
      lat: String,
      lng: String,
      jobaddress : Array,
      joblat: String,
      joblng: String,
      description : String,
      customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
      },
      quote: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
      },
      sameaddress: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
      },
      photo: String,
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

  const Providers = mongoose.model("enquiry", schema);
  return Providers;
};
