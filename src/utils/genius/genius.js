const axios = require("axios").default;
const { getSong } = require("genius-lyrics-api");
require("dotenv/config");

const token = process.env.GENIUS_TOKEN;

async function getSearchResult(query) {
    const listSearch = [];
    const urlRaw = "https://api.genius.com/search?q=";
    const url = urlRaw + query;
    const resp = await axios({
        method: "GET",
        url,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (resp.status === 200) {
        const { data } = resp;
        data.response.hits.forEach((obj) => {
            if (obj.type === "song") {
                listSearch.push({
                    id: obj.result.id,
                    title: obj.result.title,
                    artist: obj.result.artist_names,
                    trackImage: obj.result.song_art_image_thumbnail_url,
                    fullTitle: obj.result.full_title,
                    albumImage: obj.result.header_image_thumbnail_url,
                    artistImage: obj.result.primary_artist.image_url
                });
            }
        });
    }
    return listSearch;
}

async function getLyrics(searchResult) {
    const options = {
        apiKey: token,
        optimizeQuery: true
    };
    options.title = searchResult.title;
    options.artist = searchResult.artist;
    const song = await getSong(options);
    return { lyrics: song.lyrics, image: song.albumArt };
}

exports.getSearchResult = getSearchResult;
exports.getLyrics = getLyrics;
