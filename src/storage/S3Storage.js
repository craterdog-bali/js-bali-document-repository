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
 * This class implements an AWS S3 bucket based storage mechanism.  It treats
 * documents as UTF-8 encoded strings.
 */
const aws = new require('aws-sdk/clients/s3');
const s3 = new aws({apiVersion: '2006-03-01'});
const StorageMechanism = require('../StorageMechanism').StorageMechanism;


// PRIVATE CONSTANTS

// the POSIX end of line character
const EOL = '\n';


// DOCUMENT REPOSITORY

/**
 * This function creates a new instance of an S3 storage mechanism proxy.
 *
 * @param {DigitalNotary} notary The digital notary to be used to cite the documents.
 * @param {Object} configuration An object containing the S3 configuration information.
 * @param {Boolean|Number} debug An optional number in the range [0..3] that controls the level of
 * debugging that occurs:
 * <pre>
 *   0 (or false): no logging
 *   1 (or true): log exceptions to console.error
 *   2: perform argument validation and log exceptions to console.error
 *   3: perform argument validation and log exceptions to console.error and debug info to console.log
 * </pre>
 * @returns {Object} The new S3 storage mechanism proxy.
 */
const S3Storage = function(notary, configuration, debug) {
    StorageMechanism.call(this, debug);
    debug = this.debug;
    const bali = this.bali;

    // validate the arguments
    if (debug > 1) {
        const validator = bali.validator(debug);
        validator.validateType('/bali/storage/S3Storage', '$S3Storage', '$configuration', configuration, [
            '/javascript/Object'
        ]);
    }

    this.toString = function() {
        const catalog = bali.catalog({
            $module: '/bali/storage/S3Storage',
            $configuration: configuration
        });
        return catalog.toString();
    };

    this.nameExists = async function(name) {
        const location = generateLocation('names');
        const identifier = generateNameIdentifier(name);
        return await componentExists(location, identifier);
    };

    this.readName = async function(name) {
        const location = generateLocation('names');
        const identifier = generateNameIdentifier(name);
        const bytes = await readComponent(location, identifier);
        if (bytes) {
            const source = bytes.toString('utf8');
            const citation = bali.component(source);
            return citation;
        }
    };

    this.writeName = async function(name, citation) {
        const location = generateLocation('names');
        const identifier = generateNameIdentifier(name);
        if (await componentExists(location, identifier)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$writeName',
                $exception: '$nameExists',
                $name: name,
                $location: location,
                $identifier: identifier,
                $citation: citation,
                $text: 'The named citation already exists.'
            });
            throw exception;
        }
        await writeComponent(location, identifier, citation);
        return citation;
    };

    this.documentExists = async function(citation) {
        const location = generateLocation('documents');
        const identifier = generateDocumentIdentifier(citation);
        return await componentExists(location, identifier);
    };

    this.readDocument = async function(citation) {
        const location = generateLocation('documents');
        const identifier = generateDocumentIdentifier(citation);
        const bytes = await readComponent(location, identifier);
        if (bytes) {
            const source = bytes.toString('utf8');
            const document = bali.component(source);
            return document;
        }
    };

    this.writeDocument = async function(document) {
        var location = generateLocation('contracts');
        const citation = await notary.citeDocument(document);
        const identifier = generateDocumentIdentifier(citation);
        if (await componentExists(location, identifier)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$writeDocument',
                $exception: '$contractExists',
                $location: location,
                $identifier: identifier,
                $document: document,
                $text: 'A committed contract with the same tag and version already exists.'
            });
            throw exception;
        }
        location = generateLocation('documents');
        await writeComponent(location, identifier, document, true);
        return citation;
    };

    this.deleteDocument = async function(citation) {
        const location = generateLocation('documents');
        const identifier = generateDocumentIdentifier(citation);
        const bytes = await readComponent(location, identifier);
        if (bytes) {
            const source = bytes.toString('utf8');
            const document = bali.component(source);
            await deleteComponent(location, identifier);
            return document;
        }
    };

    this.contractExists = async function(citation) {
        const location = generateLocation('contracts');
        const identifier = generateDocumentIdentifier(citation);
        return await componentExists(location, identifier);
    };

    this.readContract = async function(citation) {
        const location = generateLocation('contracts');
        const identifier = generateDocumentIdentifier(citation);
        const bytes = await readComponent(location, identifier);
        if (bytes) {
            const source = bytes.toString('utf8');
            const contract = bali.component(source);
            return contract;
        }
    };

    this.writeContract = async function(contract) {
        var location = generateLocation('contracts');
        const document = contract.getValue('$document');
        const citation = await notary.citeDocument(document);
        const identifier = generateDocumentIdentifier(citation);
        if (await componentExists(location, identifier)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$writeContract',
                $exception: '$contractExists',
                $location: location,
                $identifier: identifier,
                $contract: contract,
                $text: 'The contract already exists.'
            });
            throw exception;
        }
        await writeComponent(location, identifier, contract);
        location = generateLocation('documents');
        await deleteComponent(location, identifier);
        return citation;
    };

    this.messageAvailable = async function(bag) {
        const location = generateLocation('messages');
        const identifier = generateBagIdentifier(bag, 'available');
        const list = await listComponents(location, identifier);
        return list.length > 0;
    };

    this.messageCount = async function(bag) {
        const location = generateLocation('messages');
        const identifier = generateBagIdentifier(bag, 'available');
        const list = await listComponents(location, identifier);
        return list.length;
    };

    this.addMessage = async function(bag, message) {
        const contract = await this.readContract(bag);
        if (!contract) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$addMessage',
                $exception: '$noBag',
                $location: location,
                $identifier: available,
                $message: message,
                $text: 'The bag does not exist.'
            });
            throw exception;
        }
        const capacity = contract.getValue('$document').getValue('$capacity');
        const current = await this.messageCount(bag);
        if (current >= capacity) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$addMessage',
                $exception: '$bagFull',
                $bag: bag,
                $capacity: capacity,
                $message: message,
                $text: 'The message bag is already at full capacity.'
            });
            throw exception;
        }
        const location = generateLocation('messages');
        const citation = await notary.citeDocument(message);
        const available = generateMessageIdentifier(bag, 'available', citation);
        if (await componentExists(location, available)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$addMessage',
                $exception: '$messageExists',
                $location: location,
                $identifier: available,
                $message: message,
                $text: 'The message is already available in the bag.'
            });
            throw exception;
        }
        const processing = generateMessageIdentifier(bag, 'processing', citation);
        if (await componentExists(location, processing)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$addMessage',
                $exception: '$messageExists',
                $location: location,
                $identifier: processing,
                $message: message,
                $text: 'The message is already being processed.'
            });
            throw exception;
        }
        await writeComponent(location, available, message, true);
    };

    this.removeMessage = async function(bag) {
        const location = generateLocation('messages');
        const available = generateBagIdentifier(bag, 'available');
        const processing = generateBagIdentifier(bag, 'processing');
        while (true) {
            const list = await listComponents(location, available);
            const count = list.length;
            if (count === 0) break;  // no more messages
            const messages = bali.list(list);
            // select a message at random since a distributed bag cannot guarantee FIFO
            const generator = bali.generator();
            const index = generator.generateIndex(count);
            const identifier = messages.getItem(index).getValue();
            const availableMessage = available + '/' + identifier;
            const bytes = await readComponent(location, availableMessage);
            if (!bytes) {
                // someone else got there first, keep trying
                continue;
            }
            if (! await deleteComponent(location, availableMessage)) {
                // someone else got there first, keep trying
                continue;
            }
            // we got there first
            const processingMessage = processing + '/' + identifier;
            await writeComponent(location, processingMessage, bytes, true);
            const source = bytes.toString('utf8');
            const message = bali.component(source);
            return message;
        }
    };

    this.returnMessage = async function(bag, message) {
        const location = generateLocation('messages');
        var citation = await notary.citeDocument(message);
        const processing = generateMessageIdentifier(bag, 'processing', citation);
        if (! await deleteComponent(location, processing)) {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$returnMessage',
                $exception: '$leaseExpired',
                $location: location,
                $identifier: processing,
                $message: message,
                $text: 'The lease on the message has expired.'
            });
            throw exception;
        }
        const version = bali.version.nextVersion(message.getParameter('$version'));
        message.setParameter('$version', version);
        citation = await notary.citeDocument(message);
        const available = generateMessageIdentifier(bag, 'available', citation);
        await writeComponent(location, available, message, true);
    };

    this.deleteMessage = async function(bag, citation) {
        const location = generateLocation('messages');
        const identifier = generateMessageIdentifier(bag, 'processing', citation);
        const bytes = await readComponent(location, identifier);
        if (bytes) {
            const source = bytes.toString('utf8');
            const message = bali.component(source);
            await deleteComponent(location, identifier);
            return message;
        } else {
            const exception = bali.exception({
                $module: '/bali/storage/S3Storage',
                $procedure: '$deleteMessage',
                $exception: '$leaseExpired',
                $location: location,
                $identifier: identifier,
                $citation: citation,
                $text: 'The lease on the message has expired.'
            });
            throw exception;
        }
    };

    const generateLocation = function(type) {
        return configuration[type];
    };

    const generateNameIdentifier = function(name) {
        var identifier = name.toString().slice(1);  // remove the leading '/'
        identifier += '.bali';
        return identifier;
    };

    const generateDocumentIdentifier = function(citation) {
        var identifier = citation.getValue('$tag').toString().slice(1);  // remove the leading '#'
        identifier += '/' + citation.getValue('$version');
        identifier += '.bali';
        return identifier;
    };

    const generateBagIdentifier = function(bag, state) {
        var identifier = bag.getValue('$tag').toString().slice(1);  // remove the leading '#'
        identifier += '/' + bag.getValue('$version');
        identifier += '/' + state;
        return identifier;
    };

    const generateMessageIdentifier = function(bag, state, citation) {
        var identifier = generateBagIdentifier(bag, state);
        identifier += '/' + citation.getValue('$tag').toString().slice(1);  // remove the leading '#'
        identifier += '/' + citation.getValue('$version');
        identifier += '.bali';
        return identifier;
    };

    return this;
};
S3Storage.prototype = Object.create(StorageMechanism.prototype);
S3Storage.prototype.constructor = S3Storage;
exports.S3Storage = S3Storage;


/**
 * This function causes the current thread to sleep for the specified number of milliseconds.
 * NOTE: it must be called using 'await' or it won't work.
 *
 * @param {Number} milliseconds The number of milliseconds to sleep.
 * @returns {Promise} A promise to return after the specified time has gone by.
 */
const sleep = function(milliseconds) {
    return new Promise(function(resolve) {
        setTimeout(resolve, milliseconds);
    });
};


// AWS S3 PROMISIFICATION

const listComponents = function(location, prefix) {
    return new Promise(function(resolve, reject) {
        try {
            // the resulting list contains objects with metadata, we only want the keys
            s3.listObjectsV2({Bucket: location, Prefix: prefix, MaxKeys: 64}, function(error, data) {
                if (error) {
                    reject(error);
                } else {
                    const list = [];
                    data.Contents.forEach(function(object) {
                        list.push(object.Key.replace(prefix + '/', ''));
                    });
                    resolve(list);
                }
            });
        } catch (cause) {
            reject(cause);
        }
    });
};

const componentExists = function(location, identifier) {
    return new Promise(function(resolve, reject) {
        try {
            // the result is an object containing metadata about the object or an error
            // if it never existed
            s3.headObject({Bucket: location, Key: identifier}, function(error, data) {
                // must check for the delete marker for versioned buckets
                if (error || data.DeleteMarker || !data.ContentLength) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        } catch (cause) {
            reject(cause);
        }
    });
};

const readComponent = function(location, identifier) {
    return new Promise(function(resolve, reject) {
        try {
            // the resulting object is always a Buffer (may contain utf8 encoded string)
            s3.getObject({Bucket: location, Key: identifier}, function(error, data) {
                // must check for the delete marker for versioned buckets
                if (error || data.DeleteMarker || !data.ContentLength) {
                    resolve(undefined);
                } else {
                    resolve(data.Body);
                }
            });
        } catch (cause) {
            reject(cause);
        }
    });
};

const writeComponent = function(location, identifier, component, isMutable) {
    return new Promise(function(resolve, reject) {
        try {
            const source = component.toString() + EOL;  // add POSIX compliant <EOL>
            s3.putObject({Bucket: location, Key: identifier, Body: source}, function(error) {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        } catch (cause) {
            reject(cause);
        }
    });
};

const deleteComponent = function(location, identifier) {
    return new Promise(function(resolve, reject) {
        try {
            // NOTE: for non-versioned buckets, deleteObject returns an empty object so
            // there is no way to know whether or not the object even existed.
            s3.deleteObject({Bucket: location, Key: identifier}, function(error) {
                if (error) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        } catch (cause) {
            reject(cause);
        }
    });
};
