import {RepoController} from "./repoController.js";

class Contact
{
    Id;
    Name;
    Phone;
    Email;
}

class Contacts extends RepoController {

    constructor() {
        super("./contacts.json", new Contact(), "Id");
    }
}

export {
    Contacts,
    Contact
}