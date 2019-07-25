import Big from 'big.js'

export class Asset {
  public static readonly MAX_AMOUNT = Big('4611686018427387903') // 2^62-1

  public amount: Big
  public symbol: string
  public precision: number

  constructor(asset: string)
  constructor(amount: number | string | Big, symbol: string, precision: number)
  constructor(
    asset: number | string | Big,
    symbol?: string,
    precision?: number
  ) {
    if (
      typeof asset === 'string' &&
      typeof symbol === 'undefined' &&
      typeof precision === 'undefined'
    ) {
      const split = this.splitAssetString(asset)
      asset = split.amount
      symbol = split.symbol
      precision = split.precision
    }
    if (typeof symbol !== 'string' || !symbol.match('^[A-Z]{1,7}$')) {
      throw new TypeError('Invalid asset symbol provided')
    }
    if (
      typeof precision === 'undefined' ||
      !Number.isSafeInteger(precision) ||
      precision < 0 ||
      precision > 255
    ) {
      throw new TypeError('Invalid asset precision provided')
    }
    this.amount = Big(asset)
    this.symbol = symbol
    this.precision = precision
    this.checkAmountWithinRange()
  }

  public toString(): string {
    let assetString = this.amount.toString()
    while (assetString.length < this.precision + 1) {
      assetString = '0' + assetString
    }
    assetString =
      assetString.slice(0, assetString.length - this.precision) +
      (this.precision !== 0
        ? '.' + assetString.slice(assetString.length - this.precision)
        : '') +
      ' ' +
      this.symbol
    return assetString
  }

  public clone(): Asset {
    return new Asset(this.amount, this.symbol, this.precision)
  }

  public add(asset: Asset | string): Asset {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    if (asset.precision !== this.precision) {
      throw new Error('Precision mismatch')
    }
    if (asset.symbol !== this.symbol) {
      throw new Error('Symbol mismatch')
    }
    const value = this.clone()
    value.amount = value.amount.add(asset.amount)
    value.checkAmountWithinRange()
    return value
  }

  public subtract(asset: Asset | string): Asset {
    if (typeof asset === 'string') {
      asset = new Asset(asset)
    }
    if (asset.precision !== this.precision) {
      throw new Error('Precision mismatch')
    }
    if (asset.symbol !== this.symbol) {
      throw new Error('Symbol mismatch')
    }
    const value = this.clone()
    value.amount = value.amount.sub(asset.amount)
    value.checkAmountWithinRange()
    return value
  }

  public multiply(factor: number | string | Big): Asset {
    if (typeof factor === 'number' && !Number.isSafeInteger(factor)) {
      throw new TypeError('Factor must be an integer')
    }
    const value = this.clone()
    value.amount = value.amount.times(factor)
    value.checkAmountWithinRange()
    return value
  }

  public divide(divisor: number | string | Big): Asset {
    if (typeof divisor === 'number' && !Number.isSafeInteger(divisor)) {
      throw new TypeError('Divisor must be an integer')
    }
    const value = this.clone()
    value.amount = value.amount.div(divisor)
    value.checkAmountWithinRange()
    return value
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

  private checkAmountWithinRange() {
    if (
      !(
        this.amount.gte(Asset.MAX_AMOUNT.times(-1)) &&
        this.amount.lte(Asset.MAX_AMOUNT)
      )
    ) {
      throw new Error('Magnitude of asset amount must be less than 2^62')
    }
  }
}
