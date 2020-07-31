const mongoose = require("mongoose");

const ArticleSchema = mongoose.Schema(
  {
    _id: String,
    summary: String,
    country: String,
    author: String,
    link: String,
    language: String,
    media: String,
    title: String,
    media_content: String,
    clean_url: String,
    rights: String,
    rank: String,
    topic: String,
    published_date: Date,
    _score: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Article", ArticleSchema);
