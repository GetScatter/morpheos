const maxAmount: BigInt = BigInt(4611686018427387903) // 2^62-1

export class Asset {
  public amount: bigint
  public symbol: string
  public precision: number

  constructor(amount: bigint, symbol: string, precision: number)
  constructor(asset: string)

  constructor(asset: string | bigint, symbol?: string, precision?: number) {
    if (typeof asset === 'string') {
      const splitAsset = asset.split(' ')
      if (splitAsset.length !== 2) {
        throw new Error('Invalid asset')
      }
      this.symbol = splitAsset[1]
      const splitAmount = splitAsset[0].split('.')
      if (splitAmount.length === 2) {
        this.amount = BigInt(splitAmount[0] + splitAmount[1])
        this.precision = splitAmount[1].length
      } else if (splitAmount.length === 1) {
        this.amount = BigInt(splitAmount[0])
        this.precision = 0
      } else {
        throw new Error('Invalid asset')
      }
    } else {
      if (!symbol || !precision) {
        throw new Error('symbol and precision must be given')
      }
      this.amount = asset
      this.symbol = symbol
      this.precision = precision
    }
    const regex = new RegExp('^[A-Z]{1,7}$')
    if (!regex.test(this.symbol)) {
      throw new Error('Invalid Symbol')
    }
    if (this.precision > 8) {
      throw new Error('Precision must not be greater than 8')
    }
    this.checkAmountWithinRange()
  }

  public toString(): string {
    let assetString = this.amount.toString()
    while (assetString.length < this.precision + 1) {
      assetString = '0' + assetString
    }
    assetString =
      assetString.slice(0, assetString.length - this.precision) +
      '.' +
      assetString.slice(assetString.length - this.precision) +
      ' ' +
      this.symbol
    return assetString
  }

  public add(asset: Asset): Asset {
    if (asset.precision !== this.precision) {
      throw new Error('Precision mismatch')
    }
    if (asset.symbol !== this.symbol) {
      throw new Error('Symbol mismatch')
    }
    this.amount += asset.amount
    this.checkAmountWithinRange()
    return this
  }

  public subtract(asset: Asset): Asset {
    if (asset.precision !== this.precision) {
      throw new Error('Precision mismatch')
    }
    if (asset.symbol !== this.symbol) {
      throw new Error('Symbol mismatch')
    }
    this.amount -= asset.amount
    this.checkAmountWithinRange()
    return this
  }

  public multiply(multiplicator: number | bigint): Asset {
    if (typeof multiplicator === 'number') {
      if (Number.isInteger(multiplicator)) {
        multiplicator = BigInt(multiplicator)
      } else {
        throw new Error('Multiplcator must be integer')
      }
    }
    this.amount *= multiplicator
    this.checkAmountWithinRange()
    return this
  }

  public divide(divisor: number | bigint): Asset {
    if (typeof divisor === 'number') {
      if (Number.isInteger(divisor)) {
        divisor = BigInt(divisor)
      } else {
        throw new Error('Divisor must be integer')
      }
    }
    this.amount /= divisor
    this.checkAmountWithinRange()
    return this
  }

  private checkAmountWithinRange() {
    if (!(-maxAmount <= this.amount && this.amount <= maxAmount)) {
      throw new Error('magnitude of asset amount must be less than 2^62')
    }
  }
}