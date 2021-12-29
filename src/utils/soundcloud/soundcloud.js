const axios = require("axios");

async function getSoundCloudUrl(info) {
    const sc_a_id = "879ee6e6d6dc84d0e74b27a20d55030ab6a3a0cc";
    const query_urn =
        "soundcloud%3Asearch-autocomplete%3A56770d66f4e34b11aa42b34ec47cf54f";
    const user_id = "704923-225181-486085-807554";
    const client_id = "yeF9B1vgNUGUL7AnyRADuHfrSo0Fr9Mm";
    const { title, artist } = info;
    const query = [...title.split(" "), ...artist.split(" ")].join("%20");
    const url = `https://api-v2.soundcloud.com/search?q=${query}&sc_a_id=${sc_a_id}&variant_ids=2442&query_urn=${query_urn}&facet=model&user_id=${user_id}&client_id=${client_id}&limit=1&offset=0&linked_partitioning=1&app_version=1640084493&app_locale=en`;

    try {
        const resp = await axios({
            url: url,
            headers: {
                accept: "application/json, text/javascript, */*; q=0.01",
                "accept-language":
                    "en-IN,en-US;q=0.9,en;q=0.8,bn-IN;q=0.7,bn;q=0.6,en-GB;q=0.5,es;q=0.4",
                "sec-ch-ua":
                    '" Not A;Brand";v="99", "Chromium";v="96", "Google Chrome";v="96"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Linux"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                Referer: "https://soundcloud.com/",
                "Referrer-Policy": "origin"
            },
            body: null,
            method: "GET"
        });
        return { url: resp.data["collection"][0]["permalink_url"] };
    } catch {
        return false;
    }
}

exports.getSoundCloudUrl = getSoundCloudUrl;
