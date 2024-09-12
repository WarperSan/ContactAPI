import {RepoController} from "./repoController.js";

class Bookmark {
    Id;
    Title;
    Url;
    Category;
}

class Bookmarks extends RepoController {

    constructor() {
        super("./bookmarks.json", new Bookmark(), "Id");
    }

    async get(req, res) {
        let arg = (req.url || "").split("/").pop();

        // Get items from category
        if (arg.startsWith("category="))
        {
            const cat = arg.replace("category=", "").replace(new RegExp("%20", "g"), " ");
            const items = [];

            for (const item of this.repo.data)
                if (item.Category === cat)
                    items.push(item);

            res.writeHead(201, {'content-type': 'application/json'});
            res.end(JSON.stringify(items));
            return this.success();
        }

        // Get all categories
        if (arg === "categories")
        {
            const categories = {};

            for (const item of this.repo.data)
                categories[item.Category] = "Exists";

            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(categories));
            return this.success();
        }

        return super.get(req, res);
    }
}

export {
    Bookmarks,
    Bookmark
}