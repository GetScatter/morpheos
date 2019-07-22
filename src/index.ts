export interface Authorization {
  actor: string
  permission: string
}

export interface ScatterAccount {
  name: string
  authority?: string
}

export type FlexAuth = Authorization | ScatterAccount | string

export interface Action {
  account: string
  name: string
  authorization: FlexAuth | FlexAuth[]
  data: any
}

export class Transaction {
  public static extractAccountName(auth: FlexAuth) {
    if (typeof auth === 'string') {
      if (auth.includes('@')) {
        return auth.split('@')[0]
      } else {
        return auth
      }
    } else if ('name' in auth) {
      return auth.name
    } else {
      return auth.actor
    }
  }

  public actions: Action[]
  public eos?: Morpheos

  constructor(
    payload: Action | Transaction | Array<Action | Transaction>,
    eos?: Morpheos
  ) {
    if ('actions' in payload) {
      this.actions = payload.actions
    } else if (!Array.isArray(payload)) {
      this.actions = [payload]
    } else {
      this.actions = []
      for (const p of payload) {
        if ('actions' in p) {
          this.actions = this.actions.concat(p.actions)
        } else {
          this.actions.push(p)
        }
      }
    }
    for (const action of this.actions) {
      if (!Array.isArray(action.authorization)) {
        action.authorization = [action.authorization]
      }
      action.authorization = action.authorization.map(auth => {
        if (typeof auth === 'string') {
          if (auth.includes('@')) {
            const [actor, permission] = auth.split('@')
            return { actor, permission }
          } else {
            return { actor: auth, permission: 'active' }
          }
        } else if ('name' in auth) {
          return { actor: auth.name, permission: auth.authority || 'active' }
        } else {
          return auth
        }
      })
    }
    this.eos = eos
  }

  public async send() {
    if (!this.eos) {
      throw new Error(
        'Cannot send transaction because of missing Morpheos reference'
      )
    }
    return this.eos.transact(this.actions)
  }
}

export interface PaginationOptions {
  lower_bound?: string
  upper_bound?: string
  limit?: number
}

export class Morpheos {
  public eos: any
  constructor(eos: any) {
    if (eos.eos) {
      this.eos = eos.eos
    } else {
      this.eos = eos
    }
    if (
      !this.eos ||
      (!(this.eos.transact && this.eos.rpc && this.eos.rpc.get_table_rows) &&
        !(this.eos.transaction && this.eos.getTableRows))
    ) {
      throw new TypeError('Invalid eosjs reference provided')
    }
  }

  public async transact(
    actions: Action | Transaction | Array<Action | Transaction>,
    {
      broadcast = true,
      sign = true
    }: { broadcast?: boolean; sign?: boolean } = {}
  ) {
    const transaction = new Transaction(actions)
    actions = transaction.actions

    if (this.eos.transact) {
      return this.eos.transact(
        { actions },
        { blocksBehind: 0, expireSeconds: 60, broadcast, sign }
      )
    } else {
      // TODO When not broadcasting, this returns the plain transaction
      // instead of the serialized version that eosjs2 returns
      return this.eos.transaction({ actions }, { broadcast, sign })
    }
  }

  public async getTableRows(
    options: {
      code: string
      scope?: string
      table: string
    },
    paginationOptions: PaginationOptions = {}
  ): Promise<{ rows: any[]; more: boolean }> {
    if (!options.scope) {
      options.scope = options.code
    }
    const params = { ...options, ...paginationOptions, json: true }
    if (this.eos.rpc && this.eos.rpc.get_table_rows) {
      return this.eos.rpc.get_table_rows(params)
    } else {
      return this.eos.getTableRows(params)
    }
  }

  public async getTableRow({
    code,
    scope,
    table,
    primaryKey
  }: {
    code: string
    scope?: string
    table: string
    primaryKey?: string
  }) {
    const result = await this.getTableRows(
      { code, scope, table },
      { lower_bound: primaryKey, upper_bound: primaryKey, limit: 1 }
    )
    return result.rows[0]
  }
}
