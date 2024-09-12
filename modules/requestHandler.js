import fs from "fs";
import {Contacts} from "./controllers/contacts.js";
import {Bookmarks} from "./controllers/bookmarks.js";

const controllers = [
    new Contacts(),
    new Bookmarks()
];

const handleRequest = function (req, res)
{
    let url = req.url;

    // Process static resource
    if (url.includes("."))
        return handleStatic(req, res);

    // Process API
    if (url.startsWith("/api/"))
    {
        url = url.replace("/api/", "");

        for (const controller of controllers) {

            if (url.startsWith(controller.name))
                return controller.processRequest(req, res);
        }
    }

    return Promise.reject();
};

const mimes = {
    "html":  "text/html",
    "css": "text/css",
    "js": "text/javascript",
    "svg": "image/svg+xml",
};

const folders = {
    "html": "views",
    "css": "styles",
    "js": "js",
    "svg": "images",
    "gif": "images",
};

const parsePath = function (req) {
    let path = (req.url || "").replace("../", "").substring(1);
    let extension = path.split(".")[1];

    let absolutePath = "public/";
    let folder = folders[extension] || path;

    if (!path.startsWith(folder))
        absolutePath += folder + "/";

    absolutePath += path;

    return absolutePath;
}

const handleStatic = function (req, res) {
    const path = parsePath(req);
    const extension = path.split(".")[1];

    // If page not found, error
    if (!fs.existsSync(path))
    {
        res.writeHead(404);
        res.end("Resource not found");
        return Promise.reject();
    }

    const mime = mimes[extension] || "text/plain";

    res.writeHead(200, {'content-Type': mime });
    res.end(fs.readFileSync(path));
    return Promise.resolve();
};

export {
    handleRequest
}
