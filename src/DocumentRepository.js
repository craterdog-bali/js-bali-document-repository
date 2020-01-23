/************************************************************************
 * Copyright (c) Crater Dog Technologies(TM).  All Rights Reserved.     *
 ************************************************************************
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.        *
 *                                                                      *
 * This code is free software; you can redistribute it and/or modify it *
 * under the terms of The MIT License (MIT), as published by the Open   *
 * Source Initiative. (See http://opensource.org/licenses/MIT)          *
 ************************************************************************/
'use strict';

/*
 * This class defines a document repository that is backed by any of a set of possible storage
 * mechanisms.  It treats documents as UTF-8 encoded strings.
 */


// REPOSITORY API

/**
 * This function creates a new instance of a document repository.
 *
 * @param {Object} storage The storage mechanism to be used to maintain the documents.
 * @param {Boolean|Number} debug An optional number in the range [0..3] that controls the level of
 * debugging that occurs:
 * <pre>
 *   0 (or false): no logging
 *   1 (or true): log exceptions to console.error
 *   2: perform argument validation and log exceptions to console.error
 *   3: perform argument validation and log exceptions to console.error and debug info to console.log
 * </pre>
 * @returns {Object} The new document repository.
 */
const DocumentRepository = function(storage, debug) {
    if (debug === null || debug === undefined) debug = 0;  // default is off
    const bali = require('bali-component-framework').api(debug);
    if (debug > 1) {
        const validator = bali.validator(debug);
        validator.validateType('/bali/repositories/DocumentRepository', '$DocumentRepository', '$storage', storage, [
            '/javascript/Object'
        ]);
    }

    /**
     * This method returns a string describing this document repository.
     *
     * @returns {String} A string describing this document repository.
     */
    this.toString = function() {
        const catalog = bali.catalog({
            $module: '/bali/repositories/DocumentRepository',
            $storage: this.storage
        });
        return catalog.toString();
    };

    /**
     * This method checks to see whether or not a document citation associated with the specified
     * name exists in the document repository.
     *
     * @param {Name} name The unique name for the document citation being checked.
     * @returns {Boolean} Whether or not the document citation exists.
     */
    this.citationExists = async function(name) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$citationExists', '$name', name, [
                    '/bali/elements/Name'
                ]);
            }
            return await storage.citationExists(name);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$citationExists',
                $exception: '$unexpected',
                $name: name,
                $text: 'An unexpected error occurred while attempting to verify the existence of a citation.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method attempts to retrieve the document citation associated with the specified
     * name from the document repository.
     *
     * @param {Name} name The unique name for the document citation being fetched.
     * @returns {Catalog} A catalog containing the document citation or nothing if it doesn't
     * exist.
     */
    this.fetchCitation = async function(name) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$fetchCitation', '$name', name, [
                    '/bali/elements/Name'
                ]);
            }
            return await storage.readCitation(name);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$fetchCitation',
                $exception: '$unexpected',
                $name: name,
                $text: 'An unexpected error occurred while attempting to fetch a citation.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method associates a new name with the specified document citation in
     * the document repository.
     *
     * @param {Name} name The unique name for the specified document citation.
     * @param {Catalog} citation A catalog containing the document citation.
     */
    this.createCitation = async function(name, citation) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$createCitation', '$name', name, [
                    '/bali/elements/Name'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$createCitation', '$citation', citation, [
                    '/bali/collections/Catalog'
                ]);
            }
            await storage.writeCitation(name, citation);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$createCitation',
                $exception: '$unexpected',
                $name: name,
                $citation: citation,
                $text: 'An unexpected error occurred while attempting to create a citation.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method checks to see whether or not a draft document associated with the specified
     * tag and version exists in the document repository.
     *
     * @param {Tag} tag The unique tag for the draft document being checked.
     * @param {Version} version The version string of the draft document.
     * @returns {Boolean} Whether or not the draft document exists.
     */
    this.draftExists = async function(tag, version) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$draftExists', '$tag', tag, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$draftExists', '$version', version, [
                    '/bali/elements/Version'
                ]);
            }
            return await storage.draftExists(tag, version);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$draftExists',
                $exception: '$unexpected',
                $tag: tag,
                $version: version,
                $citation: citation,
                $text: 'An unexpected error occurred while attempting to verify the existence of a draft.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method attempts to retrieve the specified version of a draft document from
     * the document repository.
     *
     * @param {Tag} tag The unique tag for the draft document being fetched.
     * @param {Version} version The version string of the draft document.
     * @returns {Catalog} A catalog containing the draft document or nothing if it doesn't
     * exist.
     */
    this.fetchDraft = async function(tag, version) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$fetchDraft', '$tag', tag, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$fetchDraft', '$version', version, [
                    '/bali/elements/Version'
                ]);
            }
            return await storage.readDraft(tag, version);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$fetchDraft',
                $exception: '$unexpected',
                $tag: tag,
                $version: version,
                $text: 'An unexpected error occurred while attempting to fetch a draft.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method saves a draft document in the document repository. If a draft document with
     * the same tag and version string already exists in the document repository, it is
     * overwritten with the new draft.
     *
     * @param {Catalog} draft A catalog containing the draft document.
     */
    this.saveDraft = async function(draft) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$saveDraft', '$draft', draft, [
                    '/bali/collections/Catalog'
                ]);
            }
            return await storage.writeDraft(draft);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$saveDraft',
                $exception: '$unexpected',
                $draft: draft,
                $text: 'An unexpected error occurred while attempting to save a draft.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method attempts to delete from the document repository the draft document
     * associated with the specified tag and version string. If the draft document does
     * not exist, this method does nothing.
     *
     * @param {Tag} tag The unique tag for the draft document being deleted.
     * @param {Version} version The version string of the draft document.
     * @returns {Component|Undefined} The deleted draft document if it existed.
     */
    this.deleteDraft = async function(tag, version) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$deleteDraft', '$tag', tag, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$deleteDraft', '$version', version, [
                    '/bali/elements/Version'
                ]);
            }
            return await storage.deleteDraft(tag, version);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$deleteDraft',
                $exception: '$unexpected',
                $tag: tag,
                $version: version,
                $text: 'An unexpected error occurred while attempting to delete a draft.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method checks to see whether or not a document associated with the specified
     * tag and version exists in the document repository.
     *
     * @param {Tag} tag The unique tag for the document being checked.
     * @param {Version} version The version string of the document.
     * @returns {Boolean} Whether or not the document exists.
     */
    this.documentExists = async function(tag, version) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$documentExists', '$tag', tag, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$documentExists', '$version', version, [
                    '/bali/elements/Version'
                ]);
            }
            return await storage.documentExists(tag, version);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$documentExists',
                $exception: '$unexpected',
                $tag: tag,
                $version: version,
                $text: 'An unexpected error occurred while attempting to verify the existence of a document.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method attempts to retrieve the specified version of a document from
     * the document repository.
     *
     * @param {Tag} tag The unique tag for the document being fetched.
     * @param {Version} version The version string of the document.
     * @returns {Catalog} A catalog containing the document or nothing if it doesn't exist.
     */
    this.fetchDocument = async function(tag, version) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$fetchDocument', '$tag', tag, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$fetchDocument', '$version', version, [
                    '/bali/elements/Version'
                ]);
            }
            return await storage.readDocument(tag, version);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$fetchDocument',
                $exception: '$unexpected',
                $tag: tag,
                $version: version,
                $text: 'An unexpected error occurred while attempting to fetch a document.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method creates a new document in the document repository. If a document with the
     * same tag and version string already exists in the document repository, an exception
     * is thrown.
     *
     * @param {Catalog} document A catalog containing the document.
     */
    this.createDocument = async function(document) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$createDocument', '$document', document, [
                    '/bali/collections/Catalog'
                ]);
            }
            return await storage.writeDocument(document);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$createDocument',
                $exception: '$unexpected',
                $document: document,
                $text: 'An unexpected error occurred while attempting to create a document.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method checks to see whether or not the specified message queue exists in the
     * document repository.
     *
     * @param {Tag} queue The unique tag for the message queue.
     * @returns {Boolean} Whether or not the message queue exists.
     */
    this.queueExists = async function(queue) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$dequeueMessage', '$queue', queue, [
                    '/bali/elements/Tag'
                ]);
            }
            return await storage.queueExists(queue);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$queueExists',
                $exception: '$unexpected',
                $queue: queue,
                $text: 'An unexpected error occurred while attempting to check whether or not a message queue exists.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method the current number of messages that are in the specified message queue in the
     * document repository.
     *
     * @param {Tag} queue The unique tag for the message queue.
     * @returns {Number} The number of messages that are currently in the message queue.
     */
    this.messageCount = async function(queue) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$dequeueMessage', '$queue', queue, [
                    '/bali/elements/Tag'
                ]);
            }
            return await storage.messageCount(queue);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$messageCount',
                $exception: '$unexpected',
                $queue: queue,
                $text: 'An unexpected error occurred while attempting to check the number of messages that are on a queue.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method adds a new message onto the specified queue in the document repository.
     * If the queue does not exist it will be created. If it is called multiple times with
     * the same message, multiple copies of the message are placed on the queue.
     *
     * @param {Tag} queue The unique tag for the message queue.
     * @param {Catalog} message A catalog containing the message to be queued.
     */
    this.queueMessage = async function(queue, message) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$queueMessage', '$queue', queue, [
                    '/bali/elements/Tag'
                ]);
                validator.validateType('/bali/repositories/DocumentRepository', '$queueMessage', '$message', message, [
                    '/bali/collections/Catalog'
                ]);
            }
            return await storage.addMessage(queue, message);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$queueMessage',
                $exception: '$unexpected',
                $queue: queue,
                $message: message,
                $text: 'An unexpected error occurred while attempting to queue a message.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    /**
     * This method removes a randomly chosen message from the specified queue in the
     * document repository. If the queue is empty, nothing is returned.
     *
     * @param {Tag} queue The unique tag for the message queue.
     * @returns {Catalog} A catalog containing the message or nothing if the queue is empty.
     */
    this.dequeueMessage = async function(queue) {
        try {
            if (debug > 1) {
                const validator = bali.validator(debug);
                validator.validateType('/bali/repositories/DocumentRepository', '$dequeueMessage', '$queue', queue, [
                    '/bali/elements/Tag'
                ]);
            }
            return await storage.removeMessage(queue);
        } catch (cause) {
            const exception = bali.exception({
                $module: '/bali/repositories/DocumentRepository',
                $procedure: '$dequeueMessage',
                $exception: '$unexpected',
                $queue: queue,
                $text: 'An unexpected error occurred while attempting to dequeue a message.'
            }, cause);
            if (debug) console.error(exception.toString());
            throw exception;
        }
    };

    return this;
};
DocumentRepository.prototype.constructor = DocumentRepository;
exports.DocumentRepository = DocumentRepository;
