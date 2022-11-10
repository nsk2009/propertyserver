module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      company: String,
      email: String,
      phone: String,
      address: String,
      advance_cool_period: Number,
      logo: String,
      copy: String,
      facebook: String,
      youtube: String,
      twitter: String,
      pinterest: String,
      linkedin: String,
      instagram: String,
      timezone: String,
      dateformat: String,
      property: String,
      tradie: String,
      customer: Number,
      cust_subscription: Number,
      quotes: Number,
      enquiries: Number,
      tradies: Number,
      invoice: Number,
      job: Number,
      cmsLink:String,
      customerLink:String,
      templateLink:String,
      twiliocall:String,
      inbox_count: {
        type: Number,
      },
      status: {
        type: String,
        enum: ['Active', 'Inactive', 'Trash'],
        default: 'Active'
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

  const Setting = mongoose.model("setting", schema);
  return Setting;
};
