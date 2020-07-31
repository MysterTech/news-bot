const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");
const Article = require("../article.model");

dotenv.config();
mongoose.Promise = global.Promise;

console.log("Hi!!");


exports.postNews = async () => {
    console.log("Inside postNews");

    // get metadata
    console.log("getting metadata");
    try {
        var response = await axios({
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
        });
        const total_pages = parseInt(response.data.total_pages);

        // loop over max 20 pages to get latest stories
        const endIndex = (total_pages > 20) ? 20 : total_pages;

        // Initiate connection to the database
        var initConnection = await mongoose
            .connect(process.env.MONGO_URI, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
            });

        console.log("looping through " + endIndex + " pages");
        for (let index = 1; index <= endIndex; index++) {
            // get articles array from each page
            try {
                var response = await axios({
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
                });
                var articles = response.data.articles;
                console.log("recieved articles" + articles);
                /* // loop over each article to check and archive */
                for (const article of articles) {
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
                    console.log("saving article");
                    await articleObject.save((err, result) => {
                        if (err) {
                            console.log("saving failed");
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                console.log("fetching articles failed for pages after #" + index);
                break;
            }
        }
    } catch (error) {
        console.log(error);
        console.log("fetching metadata failed");
    }

    mongoose.disconnect();
}