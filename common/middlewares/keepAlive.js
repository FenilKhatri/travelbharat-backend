import axios from "axios";

const URL = "https://travelbharat-rt0x.onrender.com";

setInterval(async () => {
    try {
        const res = await axios.get(URL);
        console.log("Pinged:", res.data);
    } catch (err) {
        console.error("Ping failed:", err.message);
    }
}, 5 * 60 * 1000);