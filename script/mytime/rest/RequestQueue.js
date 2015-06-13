/**
 * @license
 * Copyright 2014 David Wolverton
 * Available under MIT license <https://raw.githubusercontent.com/dwolverton/my/master/LICENSE.txt>
 */
define(["lodash", "dojo/_base/lang", "dojo/_base/declare", "dojo/request/xhr", "mytime/persistence/LocalStorage"],
function (_, lang, declare, xhr, LocalStorage) {

    return declare([], {

        baseUrl: "",

        baseHeaders: {
            "Content-type": "application/json"
        },

        authHeaders: {
            jira: "ABC",
            bigtime: "DEF"
        },

        _queue: null,
        _requestInProgress: false,

        constructor: function() {
            this._queue = LocalStorage.retrieveObjectWithoutContext("requestQueue");
            if (!this._queue) {
                this._queue = [];
            }
        },

        postConstruct: function() {
            this._trigger();
        },

        push: function(request) {
            this._enqueue(request);
            this._trigger();
        },

        _trigger: function() {
            if (!this._requestInProgress) {
                this._doNext();
            }
        },

        _doNext: function() {
            if (this._queue.length != 0) {
                this._requestInProgress = true;
                this._do(this._queue[0]);
            }
        },

        _do: function(request) {
            var url = this.baseUrl + request.url;
            var args = {
                handleAs: "json",
                method: request.method,
                headers: this._getHeaders()
            };
            if (request.data) {
                args.data = JSON.stringify(request.data);
            }
            if (request.query) {
                args.query = request.query;
            }

            xhr(url, args).then(lang.hitch(this, function(response) {
                console.log("RESPONSE: ", response);
                if (typeof request.resolve === 'function') {
                    request.resolve(response);
                }
                this._finishedWithCurrentRequest();
            }), lang.hitch(this, function(err) {
                console.log("RESPONSE ERROR: ", err);
                // note: in Chrome get response code 0 if cannot connect to server.
                if (typeof request.reject === 'function') {
                    request.reject(err);
                }
                this._finishedWithCurrentRequest();
            }));
        },

        _finishedWithCurrentRequest: function() {
            this._requestInProgress = false;
            this._dequeue();
            this._doNext();
        },

        _getHeaders: function() {
            var headers = lang.mixin({}, this.baseHeaders);
            headers["Integration-Auth-Tokens"] = JSON.stringify(this.authHeaders);
            return headers;
        },

        _enqueue: function(request) {
            this._queue.push(request);
            LocalStorage.persistObjectWithoutContext("requestQueue", this._queue);
        },

        _dequeue: function() {
            this._queue.shift();
            LocalStorage.persistObjectWithoutContext("requestQueue", this._queue);
        }

    });
});