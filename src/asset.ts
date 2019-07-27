import * as BigInteger from 'big-integer'
type BigInteger = BigInteger.BigInteger

export class Asset {
  public static readonly MAX_AMOUNT = BigInteger('4611686018427387903') // 2^62-1
  public static readonly MAX_PRECISION = 18

  public amount: BigInteger
  public symbol: string
  public precision: number

  constructor(asset: string)
  constructor(
    amount: number | string | BigInteger,
    symbol: string,
    precision: number
  )
  constructor(
    asset: number | string | BigInteger,
    symbol?: string,
    precision?: number
  ) {
    if (
      typeof asset === 'string' &&
      typeof symbol === 'undefined' &&
      typeof precision === 'undefined'
    ) {
      ;({ amount: asset, symbol, precision } = this.splitAssetString(asset))
    }
    if (typeof symbol !== 'string' || !symbol.match('^[A-Z]{1,7}$')) {
      throw new TypeError('Invalid asset symbol provided')
    }
    if (
      typeof precision === 'undefined' ||
      !Number.isSafeInteger(precision) ||
      precision < 0 ||
      precision > Asset.MAX_PRECISION
    ) {
      throw new TypeError('Invalid asset precision provided')
    }
    this.amount = BigInteger.isInstance(asset)
      ? asset.plus(0)
      : BigInteger(asset.toString())
    this.symbol = symbol
    this.precision = precision
    this.checkAmountWithinRange()
  }

  public toString(): string {
    const isNegative = this.amount.lt(0)
    let assetString = this.amount.toString()
    if (isNegative) {
      assetString = assetString.slice(1)
    }
    while (assetString.length < this.precision + 1) {
      assetString = '0' + assetString
    }
    assetString =
      (isNegative ? '-' : '') +
      assetString.slice(0, assetString.length - this.precision) +
      (this.precision !== 0
        ? '.' + assetString.slice(assetString.length - this.precision)
        : '') +
      ' ' +
      this.symbol
    return assetString
  }

  public clone(): Asset {
    return new Asset(this.amount.plus(0), this.symbol, this.precision)
  }

  public add(asset: Asset | string): Asset {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    this.validateCompatibility(asset)
    const value = this.clone()
    value.amount = value.amount.add(asset.amount)
    value.checkAmountWithinRange()
    return value
  }

  public plus(asset: Asset | string): Asset {
    return this.add(asset)
  }

  public subtract(asset: Asset | string): Asset {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    this.validateCompatibility(asset)
    const value = this.clone()
    value.amount = value.amount.subtract(asset.amount)
    value.checkAmountWithinRange()
    return value
  }

  public minus(asset: Asset | string): Asset {
    return this.subtract(asset)
  }

  public sub(asset: Asset | string): Asset {
    return this.subtract(asset)
  }

  public multiply(factor: number | string | BigInteger): Asset {
    const value = this.clone()
    value.amount = value.amount.multiply(factor)
    value.checkAmountWithinRange()
    return value
  }

  public mul(factor: number | string | BigInteger): Asset {
    return this.multiply(factor)
  }

  public prod(factor: number | string | BigInteger): Asset {
    return this.multiply(factor)
  }

  public divide(divisor: number | string | BigInteger): Asset {
    const value = this.clone()
    value.amount = value.amount.divide(divisor)
    value.checkAmountWithinRange()
    return value
  }

  public div(divisor: number | string | BigInteger): Asset {
    return this.divide(divisor)
  }

  public equals(asset: Asset | string): boolean {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    return (
      asset &&
      (this.symbol === asset.symbol &&
        this.precision === asset.precision &&
        this.amount.eq(asset.amount))
    )
  }

  public equal(other: Asset | string): boolean {
    return this.equals(other)
  }

  public eq(other: Asset | string): boolean {
    return this.equals(other)
  }

  public greaterThan(asset: Asset | string): boolean {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    this.validateCompatibility(asset)
    return this.amount.gt(asset.amount)
  }

  public gt(asset: Asset | string): boolean {
    return this.greaterThan(asset)
  }

  public lessThan(asset: Asset | string): boolean {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    this.validateCompatibility(asset)
    return this.amount.lt(asset.amount)
  }

  public lt(asset: Asset | string): boolean {
    return this.lessThan(asset)
  }

  public greaterThanOrEqual(asset: Asset | string): boolean {
    return this.gt(asset) || this.eq(asset)
  }

  public gte(asset: Asset | string): boolean {
    return this.greaterThanOrEqual(asset)
  }

  public lessThanOrEqual(asset: Asset | string): boolean {
    return this.lt(asset) || this.eq(asset)
  }

  public lte(asset: Asset | string): boolean {
    return this.lessThanOrEqual(asset)
  }

  private splitAssetString(asset: string) {
    const invalidAsset = 'Invalid asset string provided'
    const parts = asset.split(' ')
    if (parts.length !== 2) {
      throw new TypeError(invalidAsset)
    }
    const symbol = parts[1]
    let amount: string
    let precision: number
    const splitAmount = parts[0].split('.')
    if (splitAmount.length === 2) {
      amount = splitAmount[0] + splitAmount[1]
      precision = splitAmount[1].length
    } else if (splitAmount.length === 1) {
      amount = splitAmount[0]
      precision = 0
    } else {
      throw new TypeError(invalidAsset)
    }
    return { amount, symbol, precision }
  }

  private validateCompatibility(asset: Asset) {
    if (asset.precision !== this.precision) {
      throw new TypeError('Precision mismatch')
    }
    if (asset.symbol !== this.symbol) {
      throw new TypeError('Symbol mismatch')
    }
  }

  private checkAmountWithinRange() {
    if (
      !(
        this.amount.geq(Asset.MAX_AMOUNT.negate()) &&
        this.amount.leq(Asset.MAX_AMOUNT)
      )
    ) {
      throw new Error('Magnitude of asset amount must be less than 2^62')
    }
  }
}
