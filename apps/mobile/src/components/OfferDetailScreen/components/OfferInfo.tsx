import {type OneOfferInState} from '@vexl-next/domain/src/general/offers'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import {useAtomValue, useSetAtom} from 'jotai'
import React, {useCallback, useMemo, useState} from 'react'
import {Alert, ScrollView} from 'react-native'
import {Stack, YStack} from 'tamagui'
import {type RootStackScreenProps} from '../../../navigationTypes'
import {sendRequestHandleUIActionAtom} from '../../../state/chat/atoms/sendRequestActionAtom'
import {type RequestState} from '../../../state/chat/domain'
import {useChatWithMessagesForOffer} from '../../../state/chat/hooks/useChatForOffer'
import {
  canChatBeRequested,
  getRequestState,
} from '../../../state/chat/utils/offerStates'
import {createSingleOfferReportedFlagAtom} from '../../../state/marketplace/atoms/offersState'
import {useTranslation} from '../../../utils/localization/I18nProvider'
import randomName from '../../../utils/randomName'
import {offerRerequestLimitDaysAtom} from '../../../utils/remoteConfig/atoms'
import useSafeGoBack from '../../../utils/useSafeGoBack'
import Button from '../../Button'
import ButtonWithPressTimeout from '../../ButtonWithPressTimeout'
import CommonFriends from '../../CommonFriends'
import IconButton from '../../IconButton'
import InfoSquare from '../../InfoSquare'
import OfferRequestTextInput from '../../OfferRequestTextInput'
import OfferWithBubbleTip from '../../OfferWithBubbleTip'
import ScreenTitle from '../../ScreenTitle'
import closeSvg from '../../images/closeSvg'
import {useReportOfferHandleUI} from '../api'
import flagSvg from '../images/flagSvg'
import RerequestInfo from './RerequestInfo'

function OfferInfo({
  offer,
  navigation,
}: {
  offer: OneOfferInState
  navigation: RootStackScreenProps<'OfferDetail'>['navigation']
}): JSX.Element {
  const goBack = useSafeGoBack()
  const {t} = useTranslation()
  const reportOffer = useReportOfferHandleUI()
  const reportedFlagAtom = createSingleOfferReportedFlagAtom(
    offer.offerInfo.offerId
  )
  const flagOffer = useSetAtom(reportedFlagAtom)
  const submitRequest = useSetAtom(sendRequestHandleUIActionAtom)
  const [text, setText] = useState('')
  const offerRerequestLimitDays = useAtomValue(offerRerequestLimitDaysAtom)
  const chatForOffer = useChatWithMessagesForOffer({
    offerPublicKey: offer.offerInfo.publicPart.offerPublicKey,
  })

  const spokenLanguagesText = useMemo(
    () =>
      offer.offerInfo.publicPart.spokenLanguages
        ?.map((lang) => t(`offerForm.spokenLanguages.${lang}`))
        .join(', '),
    [offer.offerInfo.publicPart.spokenLanguages, t]
  )

  const requestState: RequestState = useMemo(
    () => (chatForOffer ? getRequestState(chatForOffer) : 'initial'),
    [chatForOffer]
  )
  const requestPossibleInfo = useMemo(() => {
    if (!chatForOffer)
      return {
        canBeRerequested: true,
      } as const

    return canChatBeRequested(chatForOffer, offerRerequestLimitDays)
  }, [chatForOffer, offerRerequestLimitDays])

  const onRequestPressed = useCallback(() => {
    if (!text.trim()) return
    void pipe(
      submitRequest({text, originOffer: offer}),
      TE.match(
        (e) => {
          if (e._tag === 'ReceiverOfferInboxDoesNotExistError') {
            Alert.alert(t('common.error'), t('offer.offerNotFound'), [
              {
                text: t('common.close'),
                onPress: () => {
                  flagOffer(true)
                  goBack()
                },
              },
            ])
          }
        },
        (chat) => {
          navigation.replace('ChatDetail', {
            otherSideKey: chat.otherSide.publicKey,
            inboxKey: chat.inbox.privateKey.publicKeyPemBase64,
          })
        }
      )
    )()
  }, [flagOffer, goBack, navigation, offer, submitRequest, t, text])

  const showRequestButton =
    !chatForOffer || requestPossibleInfo.canBeRerequested

  return (
    <Stack f={1} mx="$2" my="$4">
      <ScreenTitle text={t('offer.title')}>
        {!offer.flags.reported && (
          <IconButton
            variant="dark"
            icon={flagSvg}
            onPress={() => {
              void reportOffer(offer.offerInfo.offerId)()
            }}
          />
        )}
        <IconButton variant="dark" icon={closeSvg} onPress={goBack} />
      </ScreenTitle>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack space="$2" mb="$2">
          <OfferWithBubbleTip
            negative={!requestPossibleInfo.canBeRerequested}
            offer={offer}
          />
          <CommonFriends
            contactsHashes={offer.offerInfo.privatePart.commonFriends}
            offer={offer}
            variant="dark"
          />
          {offer.offerInfo.publicPart.spokenLanguages.length > 0 && (
            <InfoSquare>
              {t('offer.offerAuthorSpeaks', {
                name:
                  chatForOffer?.chat.otherSide?.realLifeInfo?.userName ??
                  randomName(offer.offerInfo.offerId),
                spokenLanguages: spokenLanguagesText,
              })}
            </InfoSquare>
          )}
          <InfoSquare>{t(`offer.requestStatus.${requestState}`)}</InfoSquare>
          {!!showRequestButton && (
            <OfferRequestTextInput text={text} onChange={setText} />
          )}
        </YStack>
      </ScrollView>
      <Stack pt="$2">
        {showRequestButton ? (
          <ButtonWithPressTimeout
            disabled={!text.trim()}
            onPress={onRequestPressed}
            variant="secondary"
            text={t('offer.sendRequest')}
          />
        ) : (
          <>
            {requestState === 'cancelled' || requestState === 'deleted' ? (
              <RerequestInfo chat={chatForOffer} />
            ) : (
              <Button
                onPress={() => {
                  if (!chatForOffer) return
                  navigation.navigate('ChatDetail', {
                    otherSideKey: chatForOffer.chat.otherSide.publicKey,
                    inboxKey:
                      chatForOffer.chat.inbox.privateKey.publicKeyPemBase64,
                  })
                }}
                variant="primary"
                text={t('offer.goToChat')}
              />
            )}
          </>
        )}
      </Stack>
    </Stack>
  )
}

export default OfferInfo
