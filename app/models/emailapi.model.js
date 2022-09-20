module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      user: String,
      default: String,
      marketing: String,
	  mailgun_type: String,
	  live_mailgun_apikey: String,
	  live_mailgun_domain: String,
	  sand_mailgun_apikey: String,
	  sand_mailgun_domain: String,
	  mailchimp_type: String,
	  live_mailchimp_apikey: String,
	  sand_mailchimp_apikey: String,
	  gmail_type: String,
	  live_gmail_username: String,
	  live_gmail_password: String,
	  sand_gmail_username: String,
	  sand_gmail_password: String,
	  sendgrid_type: String,
	  live_sendgrid_apikey: String,
	  sand_sendgrid_apikey: String,
	  noti_sendgrid_type: String,
	  noti_live_sendgrid_apikey: String,
	  noti_sand_sendgrid_apikey: String,
	  sand_sendinblue_apikey:String,
	  sand_sendinblue_domain:String,
	  sand_sendinblue_sender:String,
	  live_sendinblue_apikey:String,
	  live_sendinblue_domain:String,
	  live_sendinblue_sender:String,
	  sendinblue_type:String,
    },
    { timestamps: true }
  );

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(mongoosePaginate);

  const Emailapi = mongoose.model("emailapis", schema);
  return Emailapi;
};
