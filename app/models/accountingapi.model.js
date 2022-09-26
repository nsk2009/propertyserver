module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      user: String,
      default: String,
	  stripe_type: String,	  
	  loan_type: String,
	  live_xero_key: String,
	  sand_xero_key: String,
	  live_loan_achkey: String,
	  live_loan_acquirekey: String,
	  live_loan_disbursekey: String,
	  sand_loan_achkey: String,
	  sand_loan_acquirekey: String,
	  sand_loan_disbursekey: String,
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
