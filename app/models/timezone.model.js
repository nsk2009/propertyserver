module.exports = (mongoose, mongoosePaginate) => {
  var schema = mongoose.Schema(
    {
      tz: String,
      tzoffset: String,
      gmt: String
    }
  );

  schema.plugin(mongoosePaginate);

  const Timezone = mongoose.model("timezones", schema);
  return Timezone;
};
