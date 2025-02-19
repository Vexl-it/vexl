import {DeleteInboxErrors} from '@vexl-next/rest-api/src/services/chat/contracts'
import {DeleteInboxEndpoint} from '@vexl-next/rest-api/src/services/chat/specification'
import {InboxDoesNotExistError} from '@vexl-next/rest-api/src/services/contact/contracts'
import makeEndpointEffect from '@vexl-next/server-utils/src/makeEndpointEffect'
import {validateChallengeInBody} from '@vexl-next/server-utils/src/services/challenge/utils/validateChallengeInBody'
import {withDbTransaction} from '@vexl-next/server-utils/src/withDbTransaction'
import {Effect} from 'effect'
import {Handler} from 'effect-http'
import {InboxDbService} from '../../db/InboxDbService'
import {MessagesDbService} from '../../db/MessagesDbService'
import {WhitelistDbService} from '../../db/WhiteListDbService'
import {hashPublicKey} from '../../db/domain'
import {withInboxActionRedisLock} from '../../utils/withInboxActionRedisLock'

export const deleteInbox = Handler.make(DeleteInboxEndpoint, (req) =>
  makeEndpointEffect(
    Effect.gen(function* (_) {
      yield* _(validateChallengeInBody(req.body))

      const hashedPublicKey = yield* _(hashPublicKey(req.body.publicKey))

      const inboxService = yield* _(InboxDbService)
      const inbox = yield* _(
        inboxService.findInboxByPublicKey(hashedPublicKey),
        Effect.flatten,
        Effect.catchTag(
          'NoSuchElementException',
          () => new InboxDoesNotExistError()
        )
      )

      const whitelistDb = yield* _(WhitelistDbService)
      yield* _(
        whitelistDb.deleteWhitelistRecordsWhereInboxIsReceiverOrSender({
          inboxId: inbox.id,
          publicKey: hashedPublicKey,
        })
      )

      const messagesDb = yield* _(MessagesDbService)
      yield* _(messagesDb.deleteAllMessagesByInboxId(inbox.id))

      yield* _(inboxService.deleteInboxByPublicKey(hashedPublicKey))

      return null
    }).pipe(withInboxActionRedisLock(req.body.publicKey), withDbTransaction),
    DeleteInboxErrors
  )
)
