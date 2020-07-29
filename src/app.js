const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");
const Article = require("./article.model");

dotenv.config();
mongoose.Promise = global.Promise;

console.log("Hi!!");

// get metadata
var params = {
    page: 1,
    total_pages: 0,
    page_size: 0,
    articles: 0,
};

var data = axios({
    method: "GET",
    url: "https://newscatcher.p.rapidapi.com/v1/search_free",
    headers: {
        "content-type": "application/octet-stream",
        "x-rapidapi-host": "newscatcher.p.rapidapi.com",
        "x-rapidapi-key": "aaa5eb5f63msh756a2b2b8bf6868p1eb547jsnd81be9a3d6bf",
        useQueryString: true,
    },
    params: {
        page_size: "100",
        media: "True",
        lang: "en",
        page: "1",
        q: "*",
    },
})
    .then((response) => {
        return response.data;
    })
    .catch((error) => {
        console.log(error);
    });
data.then((data) => {
    params = {
        page: 1,
        total_pages: data.total_pages,
        page_size: data.page_size,
        articles: data.articles,
    };
});
// Connecting to the database
mongoose
    .connect(process.env.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        console.log("Successfully connected to the database");
    })
    .catch((error) => {
        console.log(error);
    });
mongoose.connection.on("error", (err) =>
    console.log(`DB error : ${err.message}`)
);
// loop over pages using metadata
for (let index = 1; index <= params.total_pages; index++) {
    var articles = axios({
        method: "GET",
        url: "https://newscatcher.p.rapidapi.com/v1/search_free",
        headers: {
            "content-type": "application/octet-stream",
            "x-rapidapi-host": "newscatcher.p.rapidapi.com",
            "x-rapidapi-key": "aaa5eb5f63msh756a2b2b8bf6868p1eb547jsnd81be9a3d6bf",
            useQueryString: true,
        },
        params: {
            page_size: "100",
            media: "True",
            lang: "en",
            page: "1",
            q: "*",
        },
    })
        .then((response) => {
            return response.data.articles;
        })
        .catch((error) => {
            console.log(error);
        });
    // loop over each article to check and archive
    articles.then((articles) => {
        articles.forEach((article) => {
            const articleObject = new Article({
                _id: article._id,
                summary: article.summary,
                country: article.country,
                author: article.author,
                link: article.link,
                language: article.language,
                media: article.media,
                title: article.title,
                media_content: article.media_content,
                clean_url: article.clean_url,
                rights: article.rights,
                rank: article.rank,
                topic: article.topic,
                published_date: Date(article.published_date),
                _score: article._score,
            });
            // save article
            articleObject
                .save()
                .then((data) => {
                    console.log("entry saved");
                })
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Note.",
                    });
                });
        });
    });
}

mongoose.disconnect().then(() => {
    console.log("data saved");
})
