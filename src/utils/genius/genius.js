const axios = require("axios").default;
const { getSong } = require("genius-lyrics-api");
require("dotenv/config");

const query = "shape%20of%20you";
const token = process.env["GENIUS_TOKEN"];

async function get_search_result(query) {
    const listSearch = [];
    const urlRaw = "https://api.genius.com/search?q=";
    const url = urlRaw + query;
    const resp = await axios({
        method: "GET",
        url: url,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (resp.status === 200) {
        let obj;
        const data = resp.data;
        for (obj of data["response"]["hits"]) {
            if (obj["type"] === "song") {
                listSearch.push({
                    title: obj["result"]["title"],
                    artist: obj["result"]["artist_names"],
                    trackImage: obj["result"]["song_art_image_thumbnail_url"],
                    fullTitle: obj["result"]["full_title"],
                    albumImage: obj["result"]["header_image_thumbnail_url"],
                    artistImage: obj["result"]["primary_artist"]["image_url"]
                });
            }
        }
    }
    return listSearch;
}

async function get_lyrics(search_result) {
    let options = {
        apiKey: token,
        optimizeQuery: true
    };
    options["title"] = search_result["title"];
    options["artist"] = search_result["artist"];
    const song = await getSong(options);
    return song.lyrics;
}
