export interface Authorization {
  actor: string
  permission: string
}

export interface Action {
  account: string
  name: string
  authorization: Authorization[]
  data: any
}

export class SendableTransaction {
  public actions: Action[]
  public eos: Morpheos

  constructor(
    payload: Action | SendableTransaction | Array<Action | SendableTransaction>,
    eos: Morpheos
  ) {
    if (payload instanceof SendableTransaction) {
      this.actions = payload.actions
    } else if (!Array.isArray(payload)) {
      this.actions = [payload]
    } else {
      this.actions = []
      for (const p of payload) {
        if (p instanceof SendableTransaction) {
          this.actions = this.actions.concat(p.actions)
        } else {
          this.actions.push(p)
        }
      }
    }
    this.eos = eos
  }

  public async send() {
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
    if (eos instanceof Morpheos) {
      this.eos = eos.eos
    } else {
      this.eos = eos
    }
  }

  public async transact(actions: Array<Action | SendableTransaction>) {
    const transaction = new SendableTransaction(actions, this)
    actions = transaction.actions
    if (this.eos.transact) {
      return this.eos.transact(
        { actions },
        { blocksBehind: 0, expireSeconds: 60 }
      )
    } else {
      return this.eos.transaction({ actions })
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
      { lower_bound: primaryKey, limit: 1 }
    )
    return result.rows[0]
  }
}
