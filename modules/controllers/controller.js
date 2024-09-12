const NOT_IMPLEMENTED = function (res, name) {
    res.writeHead(501);
    res.end(`The endpoint '${name}' was not implemented.`);
    return Promise.reject();
};

/**
 * Class that manages the requests to a module
 */
class Controller {

    constructor() {
        this.name = this.constructor.name.toLowerCase();
    }

    /** Processes the given request */
    processRequest(req, res) {
        let promise;

        switch (req.method) {
            case 'GET':
                promise = this.get(req, res);
                break;
            case 'POST':
                promise = this.post(req, res);
                break;
            case 'PUT':
                promise = this.put(req, res);
                break;
            case 'DELETE':
                promise = this.delete(req, res);
                break;
            case 'PATCH':
                promise = this.patch(req, res);
                break;
            default:
                promise = NOT_IMPLEMENTED(res, req.method);
                break;
        }

        return promise || Promise.reject();
    };

    getPayload(req) {
        return new Promise(resolve => {
            let body = [];
            req.on('data', chunk => body += chunk);
            req.on('end', () => {

                // If body missing, skip
                if (body.length === 0) {
                    resolve(null);
                    return;
                }

                // If body is not JSON, skip
                if (req.headers['content-type'] !== "application/json") {
                    resolve(null);
                    return;
                }

                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    console.log(error);
                    resolve(null);
                }
            });
        });
    }

    /**
     * Called when a request with the method GET is received
     * @param req Request
     * @param res Response
     */
    get(req, res) {
        return NOT_IMPLEMENTED(res, "GET");
    }

    /**
     * Called when a request with the method POST is received
     * @param req Request
     * @param res Response
     */
    post(req, res) {
        return NOT_IMPLEMENTED(res, "POST");
    }

    /**
     * Called when a request with the method PUT is received
     * @param req Request
     * @param res Response
     */
    put(req, res) {
        return NOT_IMPLEMENTED(res, "PUT");
    }

    /**
     * Called when a request with the method PATCH is received
     * @param req Request
     * @param res Response
     */
    patch(req, res) {
        return NOT_IMPLEMENTED(res, "PATCH");
    }

    /**
     * Called when a request with the method DELETE is received
     * @param req Request
     * @param res Response
     */
    delete(req, res) {
        return NOT_IMPLEMENTED(res, "DELETE");
    }

    /** Returns a success of the request */
    success() {
        return Promise.resolve();
    }

    /** Returns a failure of the request */
    error() {
        return Promise.reject();
    }
}

export {
    Controller
}