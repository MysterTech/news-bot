const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");
const Article = require("./article.model");

dotenv.config();
mongoose.Promise = global.Promise;

console.log("Hi!!");

// get metadata
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
var total_pages = data.then((data) => {
    console.log("metadata recieved");
    return parseInt(data.total_pages);
});
// loop over pages using metadata
total_pages.then((total_pages) => addArticles(total_pages));

function addArticles(total_pages) {
    console.log("inside addArticles function");
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
    for (let index = 1; index <= total_pages; index++) {
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
                page: index.toString,
                q: "*",
            },
        })
            .then((response) => {
                console.log("articles recieved for page : " + index);
                return response.data.articles;
            })
            .catch((error) => {
                console.log(error);
            });
        // loop over each article to check and archive
        articles.then((articles) => {
            articles.forEach((article) => {
                if (article.country === "IN") {
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
                }
            });
        })
            .catch((error) => {
                console.log(error);
            });
    }
};