/************************************************************************
 * Copyright (c) Crater Dog Technologies(TM).  All Rights Reserved.     *
 ************************************************************************
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.        *
 *                                                                      *
 * This code is free software; you can redistribute it and/or modify it *
 * under the terms of The MIT License (MIT), as published by the Open   *
 * Source Initiative. (See http://opensource.org/licenses/MIT)          *
 ************************************************************************/

const HTTPEngine = require('./utilities/HTTPEngine').HTTPEngine;


const DocumentEngine = function(notary, repository, debug) {
    const bali = require('bali-component-framework').api(debug);
    const handlers = {

        names: {
            HEAD: async function(parameters) {
                const name = this.extractName(parameters);
                const existing = await repository.readName(name);
                return await this.encodeResponse(parameters, existing, existing, false);  // body is stripped off
            },

            GET: async function(parameters) {
                const name = this.extractName(parameters);
                const existing = await repository.readName(name);
                return await this.encodeResponse(parameters, existing, existing, false);
            },

            PUT: async function(parameters) {
                const name = this.extractName(parameters);
                const citation = parameters.body;
                const existing = await repository.readName(name);
                const response = await this.encodeResponse(parameters, existing, existing, false);
                if (response.statusCode === 201) await repository.writeName(name, citation);
                return response;
            }
        },

        drafts: {
            HEAD: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const existing = await repository.readDraft(citation);
                return await this.encodeResponse(parameters, existing, existing, true);  // body is stripped off
            },

            GET: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const existing = await repository.readDraft(citation);
                return await this.encodeResponse(parameters, existing, existing, true);
            },

            PUT: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const draft = parameters.body;
                const existing = await repository.readDraft(citation);
                const response = await this.encodeResponse(parameters, existing, existing, true);
                if (response.statusCode < 300) await repository.writeDraft(draft);
                return response;
            },

            DELETE: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const existing = await repository.readDraft(citation);
                const response = await this.encodeResponse(parameters, existing, existing, true);
                if (response.statusCode === 200) await repository.deleteDraft(citation);
                return response;
            }
        },

        documents: {
            HEAD: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const existing = await repository.readDocument(citation);
                return await this.encodeResponse(parameters, existing, existing, false);  // body is stripped off
            },

            GET: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const existing = await repository.readDocument(citation);
                return await this.encodeResponse(parameters, existing, existing, false);
            },

            PUT: async function(parameters) {
                const citation = this.extractCitation(parameters);
                const document = parameters.body;
                const existing = await repository.readDocument(citation);
                const response = await this.encodeResponse(parameters, existing, existing, false);
                if (response.statusCode === 201) {
                    await repository.writeDocument(document);
                }
                return response;
            }
        },

        messages: {
            HEAD: async function(parameters) {
                const bag = this.extractCitation(parameters);
                const authority = await repository.readDocument(bag);
                const count = bali.number(await repository.messageCount(bag));
                return await this.encodeResponse(parameters, authority, count.getMagnitude() > 0 ? count : undefined, true);  // body is stripped off
            },

            GET: async function(parameters) {
                const bag = this.extractCitation(parameters);
                const authority = await repository.readDocument(bag);
                const count = bali.number(await repository.messageCount(bag));
                return await this.encodeResponse(parameters, authority, count, true);
            },

            PUT: async function(parameters) {
                const bag = this.extractCitation(parameters);
                const authority = await repository.readDocument(bag);
                const message = parameters.body;
                const response = await this.encodeResponse(parameters, authority, message, true);
                if (response.statusCode === 200) {
                    await repository.returnMessage(bag, message);
                } else if (response.statusCode === 201) {
                    return this.encodeError(404, parameters.responseType, 'The bag does not exist.');
                }
                return response;
            },

            POST: async function(parameters) {
                const bag = this.extractCitation(parameters);
                const authority = await repository.readDocument(bag);
                const message = parameters.body;
                const response = await this.encodeResponse(parameters, authority, message, true);
                if (response.statusCode === 201) {
                    await repository.addMessage(bag, message);
                }
                return response;
            },

            DELETE: async function(parameters) {
                const bag = this.extractCitation(parameters);
                const authority = await repository.readDocument(bag);
                var result;
                if (authority) {
                    if (parameters.resources.length === 2) {
                        // borrow a random message from the bag
                        result = await repository.borrowMessage(bag);
                    } else {
                        // permanently delete the specified message from the bag
                        const citation = this.extractSecondCitation(parameters);
                        result = bali.probability(await repository.deleteMessage(bag, citation));
                    }
                }
                return await this.encodeResponse(parameters, authority, result, true);
            }
        }

    };
    HTTPEngine.call(this, notary, repository, handlers, debug);
    return this;
};
DocumentEngine.prototype = Object.create(HTTPEngine.prototype);
DocumentEngine.prototype.constructor = DocumentEngine;
exports.DocumentEngine = DocumentEngine;