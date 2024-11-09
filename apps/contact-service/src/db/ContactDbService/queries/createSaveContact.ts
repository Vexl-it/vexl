import {SqlClient, SqlResolver} from '@effect/sql'
import {UnexpectedServerError} from '@vexl-next/domain/src/general/commonErrors'
import {HashedPhoneNumberE} from '@vexl-next/domain/src/general/HashedPhoneNumber.brand'
import {Effect, flow, Schema} from 'effect'

const InsertContactParams = Schema.Struct({
  hashFrom: HashedPhoneNumberE,
  hashTo: HashedPhoneNumberE,
})
export type InsertContactParams = Schema.Schema.Type<typeof InsertContactParams>

export const createInsertContact = Effect.gen(function* (_) {
  const sql = yield* _(SqlClient.SqlClient)

  const resolver = yield* _(
    SqlResolver.void('insertContact', {
      Request: InsertContactParams,
      execute: (params) => sql`
        INSERT INTO
          user_contact ${sql.insert(params)}
        RETURNING
          *
      `,
    })
  )

  return flow(
    resolver.execute,
    Effect.catchAll((e) =>
      Effect.zipRight(
        Effect.logError('Error in insertContact', e),
        Effect.fail(new UnexpectedServerError({status: 500}))
      )
    ),
    Effect.withSpan('insertContact query')
  )
})
