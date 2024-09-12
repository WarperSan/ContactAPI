import {createServer} from 'http';
import {handleRequest} from "./modules/requestHandler.js";

function allowAllAnonymousAccess(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
}

function accessControlConfig(req, res) {
    if (req.headers['sec-fetch-mode'] === 'cors')
        allowAllAnonymousAccess(res);
}

function CORS_Preflight(req, res) {
    return new Promise(async (resolve) => {
        if (req.method === 'OPTIONS') {
            res.end();
            resolve(true);
        }
        resolve(false);
    });
}

const server = createServer(async (req, res) => {
    accessControlConfig(req, res);

    // If request is valid with CORS, skip
    if (await CORS_Preflight(req, res))
        return;

    // If request handled, skip
    handleRequest(req, res).catch((err) => {

        // If already sent, skip
        if (res.headersSent)
            return;

        res.writeHead(500);
        res.end(err);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));

