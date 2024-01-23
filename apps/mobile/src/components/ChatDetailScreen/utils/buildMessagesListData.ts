import {
  UnixMilliseconds,
  UnixMilliseconds0,
} from '@vexl-next/domain/src/utility/UnixMilliseconds.brand'
import * as A from 'fp-ts/Array'
import {flow, pipe} from 'fp-ts/lib/function'
import {DateTime} from 'luxon'
import {type ChatMessageWithState} from '../../../state/chat/domain'
import {type TradeChecklistInState} from '../../../state/tradeChecklist/domain'
import {getAmountData} from '../../../state/tradeChecklist/utils/amount'
import {getPick} from '../../../state/tradeChecklist/utils/dateAndTime'
import {getAgreed} from '../../../state/tradeChecklist/utils/location'
import {type MessagesListItem} from '../components/MessageItem'
import {
  addVexlBotOrMessageWithStateToArray,
  getMessageTime,
  getUniqueKey,
  type VexlBotOrMessageWithState,
} from './VexlBotMessageOrMessageWithState'

function addVexlBotMessagesToMessagesListData(
  tradeChecklist: TradeChecklistInState
): (args: ChatMessageWithState[]) => VexlBotOrMessageWithState[] {
  const dateAndTimePickExists = getPick(tradeChecklist.dateAndTime)?.pick
  const amountAccepted =
    getAmountData(tradeChecklist.amount)?.status === 'accepted'
  const agreedOnLocation = getAgreed(tradeChecklist.location)
  const networkSet =
    !!tradeChecklist.network.sent || !!tradeChecklist.network.received
  const contactRevealed =
    tradeChecklist.contact.sent?.status === 'APPROVE_REVEAL' ||
    tradeChecklist.contact.received?.status === 'APPROVE_REVEAL'
  const isAllSet =
    dateAndTimePickExists &&
    amountAccepted &&
    agreedOnLocation &&
    networkSet &&
    contactRevealed

  return flow(
    A.map(
      (message): VexlBotOrMessageWithState => ({
        type: 'message',
        message,
      })
    ),
    (a) => {
      const dateAndTimeInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.dateAndTime.sent?.timestamp ?? 0,
          tradeChecklist.dateAndTime.received?.timestamp ?? 0
        )
      )

      if (dateAndTimeInteraction === 0) return a
      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'dateAndTimePreview' as const,
          date: dateAndTimeInteraction,
        },
      }

      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      const locationInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.location.sent?.timestamp ?? 0,
          tradeChecklist.location.received?.timestamp ?? 0
        )
      )

      if (locationInteraction === 0) {
        if (dateAndTimePickExists && !amountAccepted && !networkSet) {
          const dateAndTimeInteraction = UnixMilliseconds.parse(
            Math.max(
              tradeChecklist.dateAndTime.sent?.timestamp ?? 0,
              tradeChecklist.dateAndTime.received?.timestamp ?? 0
            )
          )
          const messageToInsert: VexlBotOrMessageWithState = {
            type: 'vexlBot',
            message: {
              type: 'meetingLocationSuggestionPreview' as const,
              date: UnixMilliseconds.parse(dateAndTimeInteraction + 1),
            },
          }
          return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
        }
        return a
      }

      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'meetingLocationPreview' as const,
          date: locationInteraction,
        },
      }
      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      const amountInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.amount.sent?.timestamp ?? 0,
          tradeChecklist.amount.received?.timestamp ?? 0
        )
      )

      if (amountInteraction === 0) {
        if (agreedOnLocation && !networkSet) {
          const locationInteraction = UnixMilliseconds.parse(
            Math.max(
              tradeChecklist.location.sent?.timestamp ?? 0,
              tradeChecklist.location.received?.timestamp ?? 0
            )
          )
          const messageToInsert: VexlBotOrMessageWithState = {
            type: 'vexlBot',
            message: {
              type: 'amountSuggestionPreview' as const,
              date: UnixMilliseconds.parse(locationInteraction + 1),
            },
          }
          return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
        }
        return a
      }
      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'amountPreview' as const,
          date: amountInteraction,
        },
      }

      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      const networkInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.network.sent?.timestamp ?? 0,
          tradeChecklist.network.received?.timestamp ?? 0
        )
      )

      if (networkInteraction === 0) {
        if (amountAccepted) {
          const amountInteraction = UnixMilliseconds.parse(
            Math.max(
              tradeChecklist.amount.sent?.timestamp ?? 0,
              tradeChecklist.amount.received?.timestamp ?? 0
            )
          )
          const messageToInsert: VexlBotOrMessageWithState = {
            type: 'vexlBot',
            message: {
              type: 'networkSuggestionPreview' as const,
              date: UnixMilliseconds.parse(amountInteraction + 1),
            },
          }
          return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
        }
        return a
      }

      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'networkPreview' as const,
          date: networkInteraction,
        },
      }

      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      const identityInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.identity.sent?.timestamp ?? 0,
          tradeChecklist.identity.received?.timestamp ?? 0
        )
      )

      if (identityInteraction === 0) return a
      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'identityRevealPreview' as const,
          date: identityInteraction,
        },
      }

      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      const contactInteraction = UnixMilliseconds.parse(
        Math.max(
          tradeChecklist.contact.sent?.timestamp ?? 0,
          tradeChecklist.contact.received?.timestamp ?? 0
        )
      )

      if (contactInteraction === 0) return a
      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'contactRevealPreview' as const,
          date: contactInteraction,
        },
      }

      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    },
    (a) => {
      if (!isAllSet) return a

      const tradeChecklistGreatestTimestamp = Math.max(
        ...Object.values(tradeChecklist).flatMap((entry) => [
          entry.sent?.timestamp ?? 0,
          entry.received?.timestamp ?? 0,
        ])
      ) satisfies number

      const messageToInsert: VexlBotOrMessageWithState = {
        type: 'vexlBot',
        message: {
          type: 'allSetPreview' as const,
          date: UnixMilliseconds.parse(tradeChecklistGreatestTimestamp + 1),
        },
      }
      return addVexlBotOrMessageWithStateToArray(messageToInsert)(a)
    }
  )
}

function messagesToListData(
  messages: VexlBotOrMessageWithState[]
): MessagesListItem[] {
  const result = [] as MessagesListItem[]

  let prevMessageTime: DateTime | null = null

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]
    if (!message) continue
    const messageTime = DateTime.fromMillis(getMessageTime(message))
    if (
      prevMessageTime &&
      prevMessageTime.diff(messageTime, 'minutes').minutes > 10
    ) {
      result.push({
        type: 'time',
        time: prevMessageTime,
        key: `time-${getUniqueKey(message)}`,
      })
      prevMessageTime = messageTime
    } else if (
      prevMessageTime &&
      prevMessageTime.diff(messageTime, 'minutes').minutes > 1
    ) {
      result.push({
        type: 'space',
        key: `space-${getUniqueKey(message)}`,
      })
    }
    prevMessageTime = messageTime

    if (message.type === 'message')
      result.push({
        type: 'message',
        time: messageTime,
        message: message.message,
        isLatest: i === messages.length - 1,
        key: `message-${getUniqueKey(message)}`,
      })
    else {
      result.push({
        type: 'vexlBot',
        key: `vexlBot-${getUniqueKey(message)}`,
        data: message.message,
      })
    }
  }

  const vexlBotTradingChecklistMessage: MessagesListItem = {
    type: 'vexlBot',
    key: 'vexlBot-tradeChecklistReminder',
    data: {
      type: 'tradeChecklistSuggestion',
      date: UnixMilliseconds0,
    },
  }

  // Vexl bot should be displayed after the first message
  if (result.length < 2) return [...result, vexlBotTradingChecklistMessage]
  return [
    ...result.slice(0, -1),
    vexlBotTradingChecklistMessage,
    ...result.slice(-1),
  ]
}

export default function buildMessagesListData(
  messages: ChatMessageWithState[],
  tradeChecklist: TradeChecklistInState
): MessagesListItem[] {
  return pipe(
    messages,
    addVexlBotMessagesToMessagesListData(tradeChecklist),
    messagesToListData
  )
}
