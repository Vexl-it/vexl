import {Schema} from '@effect/schema'
import {type FcmToken} from '@vexl-next/domain/src/utility/FcmToken.brand'
import {SendingNotificationError} from '@vexl-next/rest-api/src/services/notification/contract'
import {Effect, Layer} from 'effect'
import {cert, initializeApp, type ServiceAccount} from 'firebase-admin/app'
import {getMessaging, type Message} from 'firebase-admin/messaging'
import {EnvironmentConstants, type Environment} from './EnvironmentLayer'

export class FirebaseMessagingError extends Schema.TaggedError<FirebaseMessagingError>(
  'FirebaseMessagingError'
)('FirebaseMessagingError', {}) {}

export function sendFirebaseMessage({
  token,
  data,
}: Message & {
  token: FcmToken
  data: Record<string, string>
}): Effect.Effect<
  string,
  SendingNotificationError,
  FirebaseMessagingLayer | Environment
> {
  return Effect.gen(function* (_) {
    const messaging = yield* _(FirebaseMessagingLayer)

    return yield* _(
      Effect.tryPromise({
        try: async () =>
          await messaging.send({
            token,
            data,
            android: {priority: 'high'},
            apns: {
              payload: {
                aps: {
                  contentAvailable: true,
                },
              },
            },
          }),
        catch: () => new SendingNotificationError({tokenInvalid: false}),
      })
    )
  }).pipe(
    Effect.tapError((e) => Effect.logInfo('Error while sending message', e)),
    Effect.tapDefect((d) => Effect.logError('Defect while sending message', d))
  )
}

export class FirebaseInitializationError extends Schema.TaggedError<FirebaseInitializationError>()(
  'FirebaseInitializationError',
  {
    originalError: Schema.Unknown,
    message: Schema.String,
  }
) {}

export class FirebaseMessagingLayer extends Effect.Tag('FirebaseMessaging')<
  FirebaseMessagingLayer,
  ReturnType<typeof getMessaging>
>() {
  static readonly Live = Layer.effect(
    FirebaseMessagingLayer,
    Effect.gen(function* (_) {
      const firebaseCredentials = yield* _(
        EnvironmentConstants.FIREBASE_CREDENTIALS
      )
      yield* _(
        Effect.try({
          try: () =>
            initializeApp({
              credential: cert(firebaseCredentials as ServiceAccount),
            }),
          catch: (e) =>
            new FirebaseInitializationError({
              originalError: e,
              message: `Error while calling initializeApp`,
            }),
        })
      )
      return getMessaging()
    }).pipe(
      Effect.catchAllDefect(
        (defect) =>
          new FirebaseInitializationError({
            originalError: defect,
            message: 'Unknown firebase intialization error',
          })
      )
    )
  )
}
