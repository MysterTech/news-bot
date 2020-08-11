const mongoose = require("mongoose")
const axios = require("axios");
const Article = require("../article.model");

exports.postNews = async () => {
    mongoose.set('useUnifiedTopology', true);
    mongoose.set("useNewUrlParser", true);
    try {
        await mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
        mongoose.Promise = global.Promise;
        const db = mongoose.connection;
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
        console.log("database connected")

        console.log("looping through " + 21 + " pages");
        for (let index = 1; index <= 100; index++) {
            // get articles array from each page
            try {
                var response = await axios({
                    "method": "GET",
                    "url": "https://newscatcher.p.rapidapi.com/v1/search",
                    "headers": {
                        "content-type": "application/octet-stream",
                        "x-rapidapi-host": "newscatcher.p.rapidapi.com",
                        "x-rapidapi-key": "aaa5eb5f63msh756a2b2b8bf6868p1eb547jsnd81be9a3d6bf",
                        "useQueryString": true
                    }, "params": {
                        "media": "True",
                        "sort_by": "date",
                        "lang": "en",
                        "country": "in",
                        "page": index,
                        "q": "*"
                    }
                });
                var articles = response.data.articles;
                console.log("recieved articles");
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
                            console.log("could not save article id:" + article._id);
                        }
                    });
                    console.log("article saved: " + article._id);
                }
            } catch (error) {
                console.log(error);
                console.log("fetching articles failed for pages after #" + index);
                break;
            }
        }
        mongoose.disconnect().then(console.log("database disconnected"));
    } catch (error) {
        console.log("cant connect to database. Due to error :");
        console.log(error);
    }
}

exports.saveTest = async () => {
    mongoose.set('useUnifiedTopology', true);
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
        console.log("database connected")
    } catch (error) {
        console.log("cant connect to database.")
    }
    const articleObject = new Article({
        _id: "article._id",
        summary: 'article.summary',
        country: 'article.country',
        author: 'article.author',
        link: 'article.link',
        language: 'article.language',
        media: 'article.media',
        title: 'article.title',
        media_content: 'article.media_content',
        clean_url: 'article.clean_url',
        rights: 'article.rights',
        rank: 'article.rank',
        topic: 'article.topic',
        published_date: new Date(),
        _score: 1,
    });
    // save article
    console.log("saving article");
    try { await articleObject.save(); } catch (error) {
        console.log("saving article failed");
    }
    console.log("article saved");

    mongoose.disconnect().then(console.log("database disconnected"));
}