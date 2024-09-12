import fs from 'fs';

const writeToFile = function(file, content) {
    if (!fs.existsSync(file))
        throw (`The file ${file} does not exist.`);

    fs.writeFileSync(
        file,
        JSON.stringify(content)
    );
};
const readJSON = function (file) {
    if (!file.endsWith(".json"))
        throw (`The path ${file} must point to JSON file.`);

    if (!fs.existsSync(file))
        throw (`The file ${file} does not exist.`);

    let buffer = fs.readFileSync(file);
    return JSON.parse(buffer.toString());
}

/*for (const notimplementedKey in new C()) {
    console.log(notimplementedKey);
}*/

class Repository {
    constructor(file, model, idTag) {
        this.file = file;
        this.data = readJSON(file);
        this.model = model;
        this.idTag = idTag;
    }

    /** Writes this repository to local files */
    toFile() { writeToFile(this.file, this.data); }

    /**
     * Fetches the data of this repository as a string
     * @returns {string} String version of this repository
     */
    toString() { return JSON.stringify(this.data); }

    /**
     * Finds the first item that matches the given condition
     * @param predicate Condition to match
     * @returns {*|undefined} Item found
     */
    find(predicate) {
        let item = undefined;
        predicate = predicate || (_ => true);

        for (let d of this.data) {

            // If condition invalid, skip
            if (!predicate(d))
                continue;

            item = d;
            break;
        }

        return item;
    }

    /**
     * Adds the given item
     * @param item Item to add
     */
    add(item) {

        // TODO: Check if item is valid

        // Update item
        item[this.idTag] = this.findNextId(this.idTag);

        // Update file
        this.data.push(item);
        this.toFile();
    }

    /**
     * Deletes the item with the given item
     * @param id ID of the item to delete
     * @returns {boolean} Deleted an item
     */
    delete(id) {

        let itemID = this.data.findIndex(d => d[this.idTag] === id);

        if (itemID === -1)
            return false;

        this.data.splice(itemID, 1);
        this.toFile();
        return true;
    }

    /**
     * Updates the given item if the item exists
     * @param item Item to update from
     * @returns {boolean} Updated an item
     */
    update(item) {

        // TODO: Check if item is valid

        let dataIndex = this.data.findIndex(d => d[this.idTag] === item[this.idTag]);

        if (dataIndex === -1)
            return false;

        // TODO: Actually make the item update singular fields

        this.data[dataIndex] = item;
        this.toFile();
        return true;
    }

    /**
     * Finds the next ID of this repository
     * @param idTag Name of the field that represents the ID
     * @returns {*|number}
     */
    findNextId(idTag) {

        // If nothing, start at 0
        if (this.data.length === 0)
            return 0;

        idTag = idTag || "ID";

        // Find max
        let maxID = this.data[0][idTag];

        for (let i = 1; i < this.data.length; i++) {

            let curID = this.data[i][idTag];

            if (curID > maxID)
                maxID = curID;
        }

        // Increment ID
        return maxID + 1;
    }
}

export {
    Repository
};