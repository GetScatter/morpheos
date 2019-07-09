/// <reference types="./eosjs-legacy" />

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

import { Api, JsonRpc } from 'eosjs'
import * as Eos from 'eosjs-legacy'
import 'mocha'
import { Morpheos } from '../src/index'

describe('Morpheos', () => {
  it('should instantiate an instance', async () => {
    const eos = Eos({ httpEndpoint: 'https://api.jungle.alohaeos.com' })
    const morph = new Morpheos(eos)
    assert(morph, 'Failed to instantiate an instance')
  })
})
