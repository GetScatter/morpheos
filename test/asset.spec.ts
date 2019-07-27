import { suite, test } from 'mocha-typescript'

import * as chai from 'chai'
const { assert } = chai

import * as BigInteger from 'big-integer'
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

  @test public normalizesNegativeZero() {
    assert.equal(new Asset('-0.00 EOS').toString(), '0.00 EOS')
    assert.equal(new Asset('-0 EOS').toString(), '0 EOS')
  }

  @test public normalizesTrailingDecimalPoint() {
    assert.equal(new Asset('1. EOS').toString(), '1 EOS')
    assert.equal(new Asset('123. EOS').toString(), '123 EOS')
    assert.equal(new Asset('-1. EOS').toString(), '-1 EOS')
    assert.equal(new Asset('-123. EOS').toString(), '-123 EOS')
  }

  @test public trimsLeadingZeros() {
    const tests = [
      ['010.0000 EOS', '10.0000 EOS'],
      ['0010.0012 EOS', '10.0012 EOS'],
      ['00010.01 HEY', '10.01 HEY'],
      ['0010.000123000 HI', '10.000123000 HI'],
      ['0000000010.3 BYE', '10.3 BYE']
    ]
    for (const [input, output] of tests) {
      assert.equal(new Asset(input).toString(), output)
      assert.equal(new Asset(`-${input}`).toString(), `-${output}`)
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
    assert.equal(
      new Asset('2.00 USD').mul(BigInteger(3)).toString(),
      '6.00 USD'
    )
    assert.equal(new Asset('2.00 USD').mul(-3).toString(), '-6.00 USD')
    assert.equal(new Asset('2.00 USD').mul('-3').toString(), '-6.00 USD')
    assert.equal(
      new Asset('2.00 USD').mul(BigInteger(-3)).toString(),
      '-6.00 USD'
    )
    assert.equal(new Asset('-2.00 USD').mul(3).toString(), '-6.00 USD')
    assert.equal(new Asset('-2.00 USD').mul('3').toString(), '-6.00 USD')
    assert.equal(
      new Asset('-2.00 USD').mul(BigInteger(3)).toString(),
      '-6.00 USD'
    )
    assert.throws(() => new Asset('2.00 USD').mul(3.14), RangeError)
    assert.throws(() => new Asset('-2.00 USD').mul(3.14), RangeError)
    assert.throws(() => new Asset('2.00 USD').mul(-3.14), RangeError)
  }

  @test public divide() {
    assert.equal(new Asset('6.00 USD').div(3).toString(), '2.00 USD')
    assert.equal(new Asset('6.00 USD').div('3').toString(), '2.00 USD')
    assert.equal(
      new Asset('6.00 USD').div(BigInteger(3)).toString(),
      '2.00 USD'
    )
    assert.equal(new Asset('6.00 USD').div(-3).toString(), '-2.00 USD')
    assert.equal(new Asset('6.00 USD').div('-3').toString(), '-2.00 USD')
    assert.equal(
      new Asset('6.00 USD').div(BigInteger(-3)).toString(),
      '-2.00 USD'
    )
    assert.equal(new Asset('-6.00 USD').div(3).toString(), '-2.00 USD')
    assert.equal(new Asset('-6.00 USD').div('3').toString(), '-2.00 USD')
    assert.equal(
      new Asset('-6.00 USD').div(BigInteger(3)).toString(),
      '-2.00 USD'
    )

    assert.equal(new Asset('6.00 USD').div(4).toString(), '1.50 USD')
    assert.equal(new Asset('6.00 USD').div('4').toString(), '1.50 USD')
    assert.equal(
      new Asset('6.00 USD').div(BigInteger(4)).toString(),
      '1.50 USD'
    )
    assert.equal(new Asset('6.00 USD').div(-4).toString(), '-1.50 USD')
    assert.equal(new Asset('6.00 USD').div('-4').toString(), '-1.50 USD')
    assert.equal(
      new Asset('6.00 USD').div(BigInteger(-4)).toString(),
      '-1.50 USD'
    )
    assert.equal(new Asset('-6.00 USD').div(4).toString(), '-1.50 USD')
    assert.equal(new Asset('-6.00 USD').div('4').toString(), '-1.50 USD')
    assert.equal(
      new Asset('-6.00 USD').div(BigInteger(4)).toString(),
      '-1.50 USD'
    )

    assert.equal(new Asset('1.23 EOS').div(10).toString(), '0.12 EOS')
    assert.equal(new Asset('1.23 EOS').div(100).toString(), '0.01 EOS')
    assert.throws(() => new Asset('6.00 USD').div(3.14), RangeError)
  }

  @test public equal() {
    assert.equal(new Asset('6.00 EOS').eq('6.00 EOS'), true)
    assert.equal(new Asset('6.00 EOS').eq(new Asset('6.00 EOS')), true)
    assert.equal(new Asset('6.00 EOS').eq('5.00 EOS'), false)
    assert.equal(new Asset('6.00 EOS').eq(new Asset('5.00 EOS')), false)
  }

  @test public greaterThan() {
    assert.equal(new Asset('6.00 EOS').gt('5.00 EOS'), true)
    assert.equal(new Asset('6.00 EOS').gt(new Asset('5.00 EOS')), true)
    assert.equal(new Asset('6.00 EOS').gt('9.00 EOS'), false)
    assert.equal(new Asset('6.00 EOS').gt(new Asset('9.00 EOS')), false)
    assert.equal(new Asset('-6.00 EOS').gt('-9.00 EOS'), true)
    assert.equal(new Asset('-6.00 EOS').gt(new Asset('-9.00 EOS')), true)
    assert.equal(new Asset('-6.00 EOS').gt('9.00 EOS'), false)
    assert.equal(new Asset('-6.00 EOS').gt(new Asset('9.00 EOS')), false)
    assert.throws(() => new Asset('6.00 EOS').gt('2 EOS'))
  }

  @test public lessThan() {
    assert.equal(new Asset('3.00 EOS').lt('5.00 EOS'), true)
    assert.equal(new Asset('3.00 EOS').lt(new Asset('5.00 EOS')), true)
    assert.equal(new Asset('3.00 EOS').lt('2.00 EOS'), false)
    assert.equal(new Asset('3.00 EOS').lt(new Asset('2.00 EOS')), false)
    assert.equal(new Asset('-6.00 EOS').lt('-4.00 EOS'), true)
    assert.equal(new Asset('-6.00 EOS').lt(new Asset('-4.00 EOS')), true)
    assert.equal(new Asset('-6.00 EOS').lt('-9.00 EOS'), false)
    assert.equal(new Asset('-6.00 EOS').lt(new Asset('-9.00 EOS')), false)
    assert.throws(() => new Asset('6.00 EOS').lt('2 EOS'))
  }

  @test public greaterThanOrEqual() {
    assert.equal(new Asset('3.00 EOS').gte('1.00 EOS'), true)
    assert.equal(new Asset('3.00 EOS').gte(new Asset('1.00 EOS')), true)
    assert.equal(new Asset('3.00 EOS').gte('3.00 EOS'), true)
    assert.equal(new Asset('3.00 EOS').gte(new Asset('3.00 EOS')), true)
    assert.equal(new Asset('3.00 EOS').gte('4.00 EOS'), false)
    assert.equal(new Asset('3.00 EOS').gte(new Asset('4.00 EOS')), false)
    assert.equal(new Asset('-3.00 EOS').gte('-4.00 EOS'), true)
    assert.equal(new Asset('-3.00 EOS').gte(new Asset('-4.00 EOS')), true)
    assert.equal(new Asset('-3.00 EOS').gte('-3.00 EOS'), true)
    assert.equal(new Asset('-3.00 EOS').gte(new Asset('-3.00 EOS')), true)
    assert.equal(new Asset('-3.00 EOS').gte('4.00 EOS'), false)
    assert.equal(new Asset('-3.00 EOS').gte(new Asset('4.00 EOS')), false)
    assert.throws(() => new Asset('6.00 EOS').gte('2 EOS'))
  }

  @test public lessThanOrEqual() {
    assert.equal(new Asset('3.00 EOS').lte('1.00 EOS'), false)
    assert.equal(new Asset('3.00 EOS').lte(new Asset('1.00 EOS')), false)
    assert.equal(new Asset('3.00 EOS').lte('3.00 EOS'), true)
    assert.equal(new Asset('3.00 EOS').lte(new Asset('3.00 EOS')), true)
    assert.equal(new Asset('3.00 EOS').lte('4.00 EOS'), true)
    assert.equal(new Asset('3.00 EOS').lte(new Asset('4.00 EOS')), true)
    assert.equal(new Asset('-3.00 EOS').lte('-4.00 EOS'), false)
    assert.equal(new Asset('-3.00 EOS').lte(new Asset('-4.00 EOS')), false)
    assert.equal(new Asset('-3.00 EOS').lte('-3.00 EOS'), true)
    assert.equal(new Asset('-3.00 EOS').lte(new Asset('-3.00 EOS')), true)
    assert.equal(new Asset('-3.00 EOS').lte('4.00 EOS'), true)
    assert.equal(new Asset('-3.00 EOS').lte(new Asset('4.00 EOS')), true)
    assert.throws(() => new Asset('6.00 EOS').lte('2 EOS'))
  }

  @test public clone() {
    const asset = new Asset('10 BUCKS')
    assert.deepEqual(asset, asset.clone())
  }
}
