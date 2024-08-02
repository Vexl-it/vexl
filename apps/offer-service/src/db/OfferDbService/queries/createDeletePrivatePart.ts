import {Schema} from '@effect/schema'
import {SqlResolver} from '@effect/sql'
import {PgClient} from '@effect/sql-pg'
import {PublicKeyPemBase64E} from '@vexl-next/cryptography/src/KeyHolder/brands'
import {UnexpectedServerError} from '@vexl-next/domain/src/general/commonErrors'
import {Effect, flow} from 'effect'
import {PublicPartId} from '../domain'

export const DeletePrivatePartRequest = Schema.Struct({
  forPublicKey: PublicKeyPemBase64E,
  offerId: PublicPartId,
})
export type DeletePrivatePartRequest = Schema.Schema.Type<
  typeof DeletePrivatePartRequest
>

export const createDeletePrivatePart = Effect.gen(function* (_) {
  const sql = yield* _(PgClient.PgClient)

  const DeletePrivatePart = yield* _(
    SqlResolver.void('DeletePrivatePart', {
      Request: DeletePrivatePartRequest,
      execute: (req) => sql`
        DELETE FROM offer_private
        WHERE
          ${sql.or(
          req.map((one) =>
            sql.and([
              sql`offer_id = ${one.offerId}`,
              sql`user_public_key = ${one.forPublicKey}`,
            ])
          )
        )}
      `,
    })
  )
  return flow(
    DeletePrivatePart.execute,
    Effect.catchAll((e) =>
      Effect.zipRight(
        Effect.logError('Error deleting private part', e),
        Effect.fail(new UnexpectedServerError({status: 500}))
      )
    )
  )
})
