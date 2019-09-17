/************************************************************************
 * Copyright (c) Crater Dog Technologies(TM).  All Rights Reserved.     *
 ************************************************************************
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.        *
 *                                                                      *
 * This code is free software; you can redistribute it and/or modify it *
 * under the terms of The MIT License (MIT), as published by the Open   *
 * Source Initiative. (See http://opensource.org/licenses/MIT)          *
 ************************************************************************/

const debug = 2;  // [0..3]
const directory = 'test/config/';
const mocha = require('mocha');
const assert = require('chai').assert;
const expect = require('chai').expect;
const bali = require('bali-component-framework').api();

const repositories = {
    'Local Repository': require('../index').local(directory, debug)
};

const transaction = bali.catalog({
    $timestamp: bali.moment(),
    $product: 'Snickers Bar',
    $quantity: 10,
    $price: '1.25($currency: $USD)',
    $tax: '1.07($currency: $USD)',
    $total: '13.57($currency: $USD)'
}, bali.parameters({
    $tag: bali.tag(),
    $version: bali.version(),
    $permissions: '/bali/permissions/public/v1',
    $previous: bali.pattern.NONE
}));

const source = transaction.toString();

describe('Bali Nebula™ Document Repository', function() {

    for (var key in repositories) {
        const repository = repositories[key];

        describe('Test ' + key, function() {
    
            it('should perform a citation name lifecycle', async function() {
                const name = bali.component('/bali/examples/name/v1.2.3');
    
                // make sure the new name does not yet exist in the repository
                exists = await repository.citationExists(name);
                expect(exists).is.false;
    
                // create a new name in the repository
                await repository.createCitation(name, transaction);
    
                // make sure the new name exists in the repository
                exists = await repository.citationExists(name);
                expect(exists).is.true;
    
                // fetch the new citation from the repository
                const citation = await repository.fetchCitation(name);
                expect(citation.toString()).to.equal(source);
            });
    
            it('should perform a draft document lifecycle', async function() {
                const identifier = 'BXC15F9H0V4AJVTHJHN1B6VA8PZP4S51v1.2.3';
    
                // create a new draft in the repository
                await repository.saveDraft(identifier, transaction);
    
                // make sure the new draft exists in the repository
                var exists = await repository.draftExists(identifier);
                expect(exists).is.true;
    
                // make sure the same document does not exist in the repository
                exists = await repository.documentExists(identifier);
                expect(exists).is.false;
    
                // fetch the new draft from the repository
                const draft = await repository.fetchDraft(identifier);
                expect(draft.toString()).to.equal(source);
    
                // delete the new draft from the repository
                await repository.deleteDraft(identifier);
    
                // make sure the new draft no longer exists in the repository
                exists = await repository.draftExists(identifier);
                expect(exists).is.false;
    
                // delete a non-existent draft from the repository
                await repository.deleteDraft(identifier);
    
            });
    
            it('should perform a committed document lifecycle', async function() {
                const identifier = '454J79TXY3799ZL8VNG2G4SBMVDFVPBVv3.4';
    
                // create a new document in the repository
                await repository.createDocument(identifier, transaction);
    
                // make sure the same draft does not exist in the repository
                var exists = await repository.draftExists(identifier);
                expect(exists).is.false;
    
                // make sure the new document exists in the repository
                exists = await repository.documentExists(identifier);
                expect(exists).is.true;
    
                // fetch the new document from the repository
                const document = await repository.fetchDocument(identifier);
                expect(document.toString()).to.equal(source);
    
                // make sure the new document still exists in the repository
                exists = await repository.documentExists(identifier);
                expect(exists).is.true;
    
                // attempt to create the same document in the repository
                try {
                    await repository.createDocument(identifier, transaction);
                    assert.fail('The attempt to create the same document should have failed.');
                } catch (error) {
                    // expected
                };
    
            });
    
            it('should perform a message queue lifecycle', async function() {
                const queueId = 'TGKQJ6B4Y5KPCQGRXB1817MLN2WSV6FM';
    
                // make sure the message queue is empty
                var none = await repository.dequeueMessage(queueId);
                expect(none).to.not.exist;
    
                // queue up some messages
                await repository.queueMessage(queueId, bali.component('$first', debug));
                await repository.queueMessage(queueId, bali.component('$second', debug));
                await repository.queueMessage(queueId, bali.component('$third', debug));
    
                // dequeue the messages
                var message = await repository.dequeueMessage(queueId);
                expect(message).to.exist;
                message = await repository.dequeueMessage(queueId);
                expect(message).to.exist;
                message = await repository.dequeueMessage(queueId);
                expect(message).to.exist;
    
                // make sure the message queue is empty
                none = await repository.dequeueMessage(queueId);
                expect(none).to.not.exist;
    
            });
    
        });

    }

});
