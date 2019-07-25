import { suite, test } from 'mocha-typescript'

import * as chai from 'chai'
const { assert } = chai

import { Asset } from '../src/index'

@suite
class AssetTests {
  @test public async toStringAndBack() {
    const tests = [
      '10.0000 EOS',
      '10.0012 EOS',
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
    }
  }

  @test public async trimsLeadingZeroes() {
    const tests = [
      '010.0000 EOS',
      '0010.0012 EOS',
      '00010.01 HEY',
      '0010.000123000 HI',
      '0000000010.3 BYE'
    ]
    for (const asset of tests) {
      assert.equal(new Asset(asset).toString(), this.trimLeadingZeroes(asset))
    }
  }

  private trimLeadingZeroes(asset: string) {
    while (asset.charAt(0) === '0') {
      asset = asset.slice(1)
    }
    return asset
  }
}
