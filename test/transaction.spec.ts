import { suite, test, timeout } from 'mocha-typescript'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'

import { Morpheos, Transaction } from '../src/index'

const httpEndpoint = 'https://api.jungle.alohaeos.com'
const privateKey = '5K3MYohjJLNfNGD6Dg2xuqiZcgKejos9bLHwwjkyw7eH3JxvyZj'
const chainId =
  '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'

@suite
class SendableTransactionTests {
  public eos: Api
  public morph: Morpheos

  constructor() {
    const signatureProvider = new JsSignatureProvider([privateKey])
    const rpc = new JsonRpc(httpEndpoint, { fetch })
    this.eos = new Api({
      rpc,
      signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
    this.morph = new Morpheos(this.eos)
  }

  @test(timeout(5000)) public async flatteningActions() {
    const action = {
      account: 'simplesimple',
      name: 'transfer',
      data: { from: 'from', to: 'to', assetids: [], memo: 'test' },
      authorization: [{ actor: 'account', permission: 'active' }]
    }
    const t1 = new Transaction({ ...action })
    const t2 = new Transaction({ ...action })
    const t3 = new Transaction([t1, t2])
    const all = new Transaction([action, t3])
    assert.deepEqual(all.actions, [action, t1.actions[0], t2.actions[0]])
    await assert.isFulfilled(
      this.morph.transact([action, t3], {
        broadcast: false,
        sign: false
      })
    )
  }
}
