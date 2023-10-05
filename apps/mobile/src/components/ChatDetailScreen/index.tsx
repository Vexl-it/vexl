import {type RootStackScreenProps} from '../../navigationTypes'
import {ScopeProvider} from 'jotai-molecules'
import {ChatScope, dummyChatWithMessages} from './atoms'
import {useAtomValue, useSetAtom} from 'jotai'
import {useCallback, useMemo} from 'react'
import focusChatWithMessagesAtom from '../../state/chat/atoms/focusChatWithMessagesAtom'
import MessagesListOrApprovalPreview from './components/MessagesListOrApprovalPreview'
import valueOrDefaultAtom from '../../utils/atomUtils/valueOrDefaultAtom'
import hasNonNullableValueAtom from '../../utils/atomUtils/hasNonNullableValueAtom'
import KeyboardAvoidingView from '../KeyboardAvoidingView'
import {useOnFocusAndAppState} from '../ContactListSelect/utils'
import {hideNotificationsForChatActionAtom} from '../../state/displayedNotifications'

type Props = RootStackScreenProps<'ChatDetail'>

export default function ChatDetailScreen({
  navigation,
  route: {
    params: {chatId, inboxKey},
  },
}: Props): JSX.Element {
  const hideNotificationsForChat = useSetAtom(
    hideNotificationsForChatActionAtom
  )

  const {nonNullChatWithMessagesAtom, chatExistsAtom} = useMemo(() => {
    const chatWithMessagesAtom = focusChatWithMessagesAtom({chatId, inboxKey})

    const nonNullChatWithMessagesAtom = valueOrDefaultAtom({
      nullableAtom: chatWithMessagesAtom,
      dummyValue: dummyChatWithMessages,
    })
    const chatExistsAtom = hasNonNullableValueAtom(chatWithMessagesAtom)

    return {nonNullChatWithMessagesAtom, chatExistsAtom}
  }, [chatId, inboxKey])

  const chatExists = useAtomValue(chatExistsAtom)

  useOnFocusAndAppState(
    useCallback(() => {
      hideNotificationsForChat(nonNullChatWithMessagesAtom)
    }, [hideNotificationsForChat, nonNullChatWithMessagesAtom])
  )

  if (!chatExists) return <></>

  return (
    <KeyboardAvoidingView>
      <ScopeProvider scope={ChatScope} value={nonNullChatWithMessagesAtom}>
        <MessagesListOrApprovalPreview />
      </ScopeProvider>
    </KeyboardAvoidingView>
  )
}
