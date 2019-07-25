import { suite, test } from 'mocha-typescript'

import * as chai from 'chai'
const { assert } = chai

import Big from 'big.js'
import { Asset } from '../src/index'

@suite.only
class AssetTests {
  @test public toStringAndBack() {
    const tests = [
      '10.0000 EOS',
      '10.0012 EOS',
      '0.0012 EOS',
      '10.01 HEY',
      '10.000123000 HI',
      '10.3 BYE',
      '10.0 OK',
      '10 OK',
      '100 OK',
      '10123 OK'
    ]
    for (const asset of tests) {
      assert.equal(new Asset(asset).toString(), asset)
      assert.equal(new Asset(`-${asset}`).toString(), `-${asset}`)
    }
  }

  @test public normalizesDecimals() {
    assert.equal(new Asset('.0012 EOS').toString(), '0.0012 EOS')
  }

  @test public trimsLeadingZeroes() {
    const tests = [
      '010.0000 EOS',
      '0010.0012 EOS',
      '00010.01 HEY',
      '0010.000123000 HI',
      '0000000010.3 BYE'
    ]
    for (const asset of tests) {
      assert.equal(new Asset(asset).toString(), this.trimLeadingZeroes(asset))
      assert.equal(
        new Asset(`-${asset}`).toString(),
        `-${this.trimLeadingZeroes(asset)}`
      )
    }
  }

  @test public add() {
    assert.equal(new Asset('2.00 USD').add('3.00 USD').toString(), '5.00 USD')
    assert.equal(new Asset('2.00 USD').add('-3.00 USD').toString(), '-1.00 USD')
    assert.equal(new Asset('-2.00 USD').add('3.00 USD').toString(), '1.00 USD')
    assert.throws(() => new Asset('2.00 USD').add('3 USD'), TypeError)
    assert.throws(() => new Asset('2.00 USD').add('-3 USD'), TypeError)
    assert.throws(() => new Asset('-2.00 USD').add('3 USD'), TypeError)
  }

  @test public subtract() {
    assert.equal(new Asset('5.00 USD').sub('3.00 USD').toString(), '2.00 USD')
    assert.equal(new Asset('5.00 USD').sub('7.00 USD').toString(), '-2.00 USD')
    assert.equal(new Asset('-5.00 USD').sub('4.00 USD').toString(), '-9.00 USD')
    assert.equal(new Asset('5.00 USD').sub('-7.00 USD').toString(), '12.00 USD')
    assert.throws(() => new Asset('5.00 USD').add('3 USD'), TypeError)
    assert.throws(() => new Asset('-5.00 USD').add('3 USD'), TypeError)
    assert.throws(() => new Asset('5.00 USD').add('-3 USD'), TypeError)
  }

  @test public multiply() {
    assert.equal(new Asset('2.00 USD').mul(3).toString(), '6.00 USD')
    assert.equal(new Asset('2.00 USD').mul('3').toString(), '6.00 USD')
    assert.equal(new Asset('2.00 USD').mul(Big(3)).toString(), '6.00 USD')
    assert.equal(new Asset('2.00 USD').mul(-3).toString(), '-6.00 USD')
    assert.equal(new Asset('2.00 USD').mul('-3').toString(), '-6.00 USD')
    assert.equal(new Asset('2.00 USD').mul(Big(-3)).toString(), '-6.00 USD')
    assert.equal(new Asset('-2.00 USD').mul(3).toString(), '-6.00 USD')
    assert.equal(new Asset('-2.00 USD').mul('3').toString(), '-6.00 USD')
    assert.equal(new Asset('-2.00 USD').mul(Big(3)).toString(), '-6.00 USD')
    assert.throws(() => new Asset('2.00 USD').mul(3.14), TypeError)
    assert.throws(() => new Asset('-2.00 USD').mul(3.14), TypeError)
    assert.throws(() => new Asset('2.00 USD').mul(-3.14), TypeError)
  }

  @test public divide() {
    assert.equal(new Asset('6.00 USD').div(3).toString(), '2.00 USD')
    assert.equal(new Asset('6.00 USD').div('3').toString(), '2.00 USD')
    assert.equal(new Asset('6.00 USD').div(Big(3)).toString(), '2.00 USD')
    assert.equal(new Asset('6.00 USD').div(-3).toString(), '-2.00 USD')
    assert.equal(new Asset('6.00 USD').div('-3').toString(), '-2.00 USD')
    assert.equal(new Asset('6.00 USD').div(Big(-3)).toString(), '-2.00 USD')
    assert.equal(new Asset('-6.00 USD').div(3).toString(), '-2.00 USD')
    assert.equal(new Asset('-6.00 USD').div('3').toString(), '-2.00 USD')
    assert.equal(new Asset('-6.00 USD').div(Big(3)).toString(), '-2.00 USD')
    assert.throws(() => new Asset('6.00 USD').div(3.14), TypeError)
  }

  @test public clone() {
    const asset = new Asset('10 BUCKS')
    assert.deepEqual(asset, asset.clone())
  }

  private trimLeadingZeroes(asset: string) {
    while (asset.charAt(0) === '0') {
      asset = asset.slice(1)
    }
    return asset
  }
}
