class API {
    constructor(url) {
        this.API_URL = url;
    }

    getAll() {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL,
                success: items => { resolve(items); },
                error: (xhr) => { console.log(xhr); resolve(null); }
            });
        });
    };

    get(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL + "/" + id,
                success: item => { resolve(item); },
                error: () => { resolve(null); }
            });
        });
    }

    save(item, create) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL + (create ? "" : "/" + item.Id),
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(item),
                success: (/*data*/) => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }

    delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL + "/" + id,
                type: "DELETE",
                success: () => { resolve(true); },
                error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
            });
        });
    }
}

export {
    API
}