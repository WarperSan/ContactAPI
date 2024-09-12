import {Controller} from "./controller.js";
import {Repository} from "../repository.js";

class RepoController extends Controller {
    constructor(file, model, ID_TAG) {
        super();

        this.ID_TAG = ID_TAG;
        this.repo = new Repository(
            file,
            model,
            ID_TAG
        );
    }

    get(req, res) {

        let stringID = (req.url || "").split("/").pop();
        let id = parseInt(stringID);

        // If ID invalid, return all
        if (isNaN(id)) {
            res.writeHead(200, {'content-type': 'application/json'});
            res.end(this.repo.toString());
            return this.success();
        }

        let item = this.repo.find(c => c[this.ID_TAG] === id);

        // If contact not found, error
        if (item === undefined) {
            res.writeHead(404);
            res.end(`The item of id ${id} does not exist.`);
            return this.error();
        }

        res.writeHead(201, {'content-type': 'application/json'});
        res.end(JSON.stringify(item));

        return this.success();
    }

    async post(req, res) {
        let newItem = await this.getPayload(req);

        // TODO: Check if the given item is valid

        this.repo.add(newItem);
        res.writeHead(201, {'content-type': 'application/json'});
        res.end(JSON.stringify(newItem));
        return this.success();
    }

    delete(req, res) {

        let stringID = (req.url || "").split("/").pop();
        let id = parseInt(stringID);

        // If ID invalid, return all
        if (isNaN(id)) {
            res.writeHead(404);
            res.end(`The ID '${stringID}' is not valid.`);
            return this.error();
        }

        // If deleted, return success
        if (this.repo.delete(id)) {
            res.writeHead(204);
            res.end();
            return this.success();
        }

        res.writeHead(404);
        res.end(`No item has the ID '${id}'.`);
        return this.error();
    }

    async put(req, res) {

        let item = await this.getPayload(req);

        let stringID = (req.url || "").split("/").pop();
        let id = parseInt(stringID);

        // No id given in body
        if (isNaN(id)) {
            id = item[this.ID_TAG];
        }
        // If conflict of ID
        else if (item[this.ID_TAG] !== undefined && id !== item[this.ID_TAG]) {
            res.writeHead(409);
            res.end(`Conflict of ID between the URL and the body.`);
            return this.error();
        }

        // If ID invalid, return all
        if (isNaN(id)) {
            res.writeHead(404);
            res.end(`No ID was provided.`);
            return this.error();
        }

        item[this.ID_TAG] = id;

        // If updated, return success
        if (this.repo.update(item)) {
            res.writeHead(200);
            res.end();
            return this.success();
        }

        res.writeHead(404);
        res.end(`No item with the ID '${id}' was found.`);
        return this.error();
    }
}

export {
    RepoController
}