/// <reference types="./types" />

import { suite, test } from 'mocha-typescript'

import * as chai from 'chai'
import * as chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
const { assert } = chai

import * as NodeHttpAdapter from '@pollyjs/adapter-node-http'
import { Polly, PollyServer, Request } from '@pollyjs/core'
Polly.register(NodeHttpAdapter)

import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { TextDecoder, TextEncoder } from 'util'

import * as Eos from 'eosjs-legacy'
import { Morpheos } from '../src/index'

const httpEndpoint = 'https://api.jungle.alohaeos.com'
const privateKey = '5K3MYohjJLNfNGD6Dg2xuqiZcgKejos9bLHwwjkyw7eH3JxvyZj'
const chainId =
  '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca'
const getTableRowsPath = '/v1/chain/get_table_rows'

function sameRequests(req1: Request, req2: Request) {
  assert.deepEqual(req1.method, req2.method)
  assert.deepEqual(req1.url, req2.url)
  assert.deepEqual(req1.body, req2.body)
  assert.deepEqual(req1.headers, req2.headers)
}

@suite
class MorpheosTests {
  public eos1: any
  public eos2: Api
  public morph1: Morpheos
  public morph2: Morpheos
  public polly: Polly
  public server: PollyServer

  constructor() {
    this.polly = new Polly('Morpheos', {
      adapters: ['node-http'],
      mode: 'passthrough',
      recordIfMissing: false
    })
    this.server = this.polly.server
    this.server.host(httpEndpoint, () => {
      this.server.post(getTableRowsPath).intercept((req, res) => {
        res.status(200)
        res.json({ more: false, rows: [] })
      })
    })

    this.eos1 = Eos({
      httpEndpoint,
      keyProvider: privateKey,
      chainId
    })
    this.morph1 = new Morpheos(this.eos1)

    const signatureProvider = new JsSignatureProvider([privateKey])
    const rpc = new JsonRpc(httpEndpoint, { fetch })
    this.eos2 = new Api({
      rpc,
      signatureProvider,
      textEncoder: new TextEncoder(),
      textDecoder: new TextDecoder()
    })
    this.morph2 = new Morpheos(this.eos2)
  }

  public async after() {
    await this.polly.stop()
  }

  public getNextRequest(path: string): Promise<Request> {
    return new Promise(resolve => {
      this.server.host(httpEndpoint, () => {
        this.server.any(path).once('request', (req: Request) => {
          resolve(req)
        })
      })
    })
  }

  @test public async createInstance() {
    assert.throws(() => new Morpheos(undefined), TypeError)
    assert.throws(() => new Morpheos(null), TypeError)
    assert.throws(() => new Morpheos(123), TypeError)
    assert.throws(() => new Morpheos('some string'), TypeError)
    assert.throws(() => new Morpheos(true), TypeError)
    assert.throws(() => new Morpheos(false), TypeError)
    assert.throws(() => new Morpheos([]), TypeError)
    assert.throws(() => new Morpheos({}), TypeError)
    assert.doesNotThrow(() => new Morpheos(this.eos1))
    assert.doesNotThrow(() => new Morpheos(this.eos2))
    assert.doesNotThrow(() => new Morpheos(this.morph1))
    assert.doesNotThrow(() => new Morpheos(this.morph2))
  }

  @test.skip public async getTableRowsRequests() {
    const options = {
      code: 'eosio.token',
      scope: 'EOS',
      table: 'stat'
    }
    const [req1] = await Promise.all([
      this.getNextRequest(getTableRowsPath),
      this.morph1.getTableRows(options)
    ])
    const [req2] = await Promise.all([
      this.getNextRequest(getTableRowsPath),
      this.morph2.getTableRows(options)
    ])
    sameRequests(req1, req2)
  }
}
