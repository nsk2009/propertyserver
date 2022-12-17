module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      user: String,
      default: String,	  
	  loan_type: String,
	  live_xero_key: String,
	  live_clientid: String,
	  live_clientsecret: String,
	  sand_xero_key: String,
	  sand_clientid: String,
	  sand_clientsecret: String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Paymentapi = mongoose.model("accountingapis", schema);
  return Paymentapi;
};
