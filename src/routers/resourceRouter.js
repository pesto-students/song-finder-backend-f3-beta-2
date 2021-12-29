const router = require("express").Router(),
    { getVideoId } = require("../utils/youtube/youtube"),
    { get_search_result, get_lyrics } = require("../utils/genius/genius"),
    { Auth } = require("../middlewares/auth"),
    { User } = require("../models/userModel"),
    { getSoundCloudUrl } = require("../utils/soundcloud");

router.get("/search", async (req, res) => {
    const query = req.query;
    const q = query.q;
    if (!q) {
        return res.json({});
    }

    const results = await get_search_result(q);
    return res.json({ results: results });
});

router.get("/lyrics", async (req, res) => {
    const query = req.query;
    const title = query.title;
    const artist = query.artist;

    if (!title || !artist) {
        return res.json({});
    }

    const lyrics = await get_lyrics({
        title: title,
        artist: artist
    });

    return res.json({ lyrics: lyrics });
});

router.get("/video", async (req, res) => {
    const query = req.query;
    const q = query.q;
    if (!q) {
        return res.json({});
    }
    const videoId = await getVideoId(q);
    return res.json({ videoId: videoId });
});

router.get("/audio", async (req, res) => {
    const query = req.query;
    const title = query.title;
    const artist = query.artist;
    if (!title || !artist) {
        return res.json({});
    }
    const urlData = await getSoundCloudUrl({ title: title, artist: artist });
    return res.json(urlData);
});

router.get("/searchHistory", Auth, async (req, res) => {
    const _id = req.user;
    const user = await User.findOne({ _id: _id });
    const history = user["searchHistory"];
    return res.json({ searchHistory: history });
});

exports.ResourceRouter = router;
