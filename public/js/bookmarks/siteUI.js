let BookmarkAPI = undefined;

import("../API.js").then(m => {
    class BmAPI extends m.API {
        constructor(url) {
            super(url);
        }

        getCategories()
        {
            return new Promise(resolve => {
                $.ajax({
                    url: this.API_URL + "/categories",
                    success: items => { resolve(items); },
                    error: (xhr) => { console.log(xhr); resolve(null); }
                });
            });
        }

        getAllFromCategory(category)
        {
            if (category === undefined)
                return this.getAll();

            return new Promise(resolve => {
                $.ajax({
                    url: this.API_URL + "/category=" + category,
                    success: items => { resolve(items); },
                    error: (xhr) => { console.log(xhr); resolve(null); }
                });
            });
        }
    }

    BookmarkAPI = new BmAPI("http://localhost:5000/api/bookmarks");
    Init_UI();
});

let contentScrollPosition = 0;

async function Init_UI() {
    renderBookmarks();
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });

    createCategories();
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}

async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    let bookmarks = await BookmarkAPI.getAllFromCategory(CATEGORY);
    eraseContent();
    if (bookmarks === null) {
        renderError("Service introuvable");
        return;
    }

    bookmarks.forEach(bookmark => {
        $("#content").append(renderBookmark(bookmark));
    });
    restoreContentScrollPosition();
    // Attached click events on command images
    $(".editCmd").on("click", function () {
        saveContentScrollPosition();
        renderEditContactForm(parseInt($(this).attr("editContactId")));
    });
    $(".deleteCmd").on("click", function () {
        saveContentScrollPosition();
        renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
    });
    $(".contactRow").on("click", function (e) {
        e.preventDefault();
    });
}

function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}

function eraseContent() {
    $("#content").empty();
}

function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}

function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}

function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}

function renderCreateContactForm() {
    renderContactForm();
}

async function renderEditContactForm(id) {
    showWaitingGif();
    let contact = await BookmarkAPI.get(id);
    if (contact !== null)
        renderContactForm(contact);
    else
        renderError("Favori introuvable!");
}

async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await BookmarkAPI.get(id);
    eraseContent();

    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="contactRow" data-bookmark-id=${bookmark.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="bookmarkLayout">
                    <img class="bookmarkIcon" src="${bookmark.Url}/favicon.ico" alt="${bookmark.Title}" />
                    <span><b>${bookmark.Title}</b></span>
                </div>
                <span class="bookmarkCategory">${bookmark.Category}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await BookmarkAPI.delete(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Contact introuvable!");
    }
}

function newContact() {
    contact = {};
    contact.Id = 0;
    contact.Title = "";
    contact.Url = "";
    contact.Category = "";
    return contact;
}

function renderContactForm(contact = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = contact == null;
    if (create)
        contact = newContact();

    let icon = contact.Url;

    if (icon === "")
        icon = "../images/bookmark-logo.png";
    else
        icon += "/favicon.ico";

    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="contactForm">
            <img src="${icon}" alt="" style="width: 3em; height: 3em;"/>
            <br><br>
        
            <input type="hidden" name="Id" value="${contact.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${contact.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer l'url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${contact.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer la catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${contact.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let contact = getFormData($("#contactForm"));
        contact.Id = parseInt(contact.Id);
        showWaitingGif();
        let result = await BookmarkAPI.save(contact, create);
        if (result)
        {
            createCategories();
            renderBookmarks();
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    return $(`
     <div class="contactRow" data-bookmark-id=${bookmark.Id}">
        <div class="contactContainer noselect">
            <div class="contactLayout">
                <div class="bookmarkLayout">
                    <img class="bookmarkIcon" src="${bookmark.Url}/favicon.ico" alt="${bookmark.Title}" />
                    <span><b>${bookmark.Title}</b></span>
                </div>
                <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div>           
    `);
}

/* MENU ICONS */
let CATEGORY = undefined;

async function createCategories()
{
    const list = $("#categories-list");

    list.empty();

    const categories = await BookmarkAPI.getCategories();

    for (const categoriesKey in categories)
        list.append(createMenuIcon(categoriesKey));

    $("#allCmd").on("click", function () {
        $(".dropdown-item").each(function () {
            $(this).children("i")[0].classList.remove("fa-check");
        });

        $(this).children("i")[0].classList.add("fa-check");
        CATEGORY = undefined;
        renderBookmarks();
    });
}

function createMenuIcon(category)
{
    let icon = $('<div class=\"dropdown-item\" id=\"allCmd\"><i class=\"menuIcon fa mx-2\"></i>' + category + '</div>');

    icon.on("click", function ()
    {
        $(".dropdown-item").each(function () {
            $(this).children("i")[0].classList.remove("fa-check");
        });

        if (CATEGORY === category)
        {
            CATEGORY = undefined;
            $("#allCmd").children("i")[0].classList.add("fa-check");
        }
        else
        {
            CATEGORY = category;
            $(this).children("i")[0].classList.add("fa-check");
        }

        renderBookmarks();
    });

    return icon;
}