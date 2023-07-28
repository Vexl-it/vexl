import {useCallback, useEffect} from 'react'
import dynamicLinks, {
  type FirebaseDynamicLinksTypes,
} from '@react-native-firebase/dynamic-links'
import reportError from '../reportError'
import {Alert} from 'react-native'
import {translationAtom, useTranslation} from '../localization/I18nProvider'
import parse from 'url-parse'
import {LINK_TYPE_IMPORT_CONTACT} from './domain'
import {atom, useSetAtom} from 'jotai'
import {pipe} from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {parseJson, safeParse} from '../fpUtils'
import {ImportContactFromLinkPayload} from '../../state/contacts/domain'
import {askAreYouSureActionAtom} from '../../components/AreYouSureDialog'
import {importContactFromLinkActionAtom} from '../../state/contacts'
import {loadingOverlayDisplayedAtom} from '../../components/LoadingOverlayProvider'
import {toCommonErrorMessage} from '../useCommonErrorMessages'
import userSvg from '../../components/images/userSvg'

type DynamicLink = FirebaseDynamicLinksTypes.DynamicLink

const handleImportDeepContactActionAtom = atom(
  null,
  (get, set, contactJsonString: string) => {
    const {t} = get(translationAtom)
    return pipe(
      parseJson(contactJsonString),
      E.chainW(safeParse(ImportContactFromLinkPayload)),
      TE.fromEither,
      TE.bindTo('contact'),
      TE.bindW('customName', ({contact}) =>
        pipe(
          set(askAreYouSureActionAtom, {
            steps: [
              {
                title: t('postLoginFlow.contactsList.addContact'),
                description: t('postLoginFlow.contactsList.addThisPhoneNumber'),
                subtitle: contact.numberToDisplay,
                negativeButtonText: t('common.notNow'),
                positiveButtonText: t('postLoginFlow.contactsList.addContact'),
                type: 'StepWithInput',
                textInputProps: {
                  autoCorrect: false,
                  placeholder: t('postLoginFlow.contactsList.addContactName'),
                  variant: 'greyOnWhite',
                  icon: userSvg,
                },
              },
            ],
            variant: 'info',
          }),
          TE.map((result) =>
            result[0].type === 'inputResult' ? result[0].value : contact.name
          )
        )
      ),
      TE.map((r) => {
        set(loadingOverlayDisplayedAtom, true)
        return r
      }),
      TE.bindW('importContactResult', ({contact, customName}) =>
        set(importContactFromLinkActionAtom, {...contact, name: customName})
      ),
      TE.map((r) => {
        set(loadingOverlayDisplayedAtom, false)
        return r
      }),
      TE.chainFirstW(({customName}) =>
        set(askAreYouSureActionAtom, {
          steps: [
            {
              type: 'StepWithText',
              title: t('postLoginFlow.contactsList.contactAdded'),
              description: t('postLoginFlow.contactsList.youHaveAddedContact', {
                contactName: customName,
              }),
              positiveButtonText: t('common.niceWithExclamationMark'),
            },
          ],
          variant: 'info',
        })
      ),
      TE.match(
        (l) => {
          set(loadingOverlayDisplayedAtom, false)
          if (l._tag === 'UserDeclinedError') {
            return
          }

          if (l._tag !== 'NetworkError') {
            reportError('error', 'Error while importing contact from link', l)
          }

          Alert.alert(
            toCommonErrorMessage(l, get(translationAtom).t) ??
              get(translationAtom).t('common.unknownError')
          )
        },
        () => {
          // Everything in its right place
        }
      )
    )
  }
)

export function useHandleDeepLink(): void {
  const {t} = useTranslation()
  const handleImportDeepContact = useSetAtom(handleImportDeepContactActionAtom)

  const onLinkReceived = useCallback(
    (link: DynamicLink) => {
      const url = link.url
      const parsedUrl = parse(url, true)

      switch (parsedUrl.query.type) {
        case LINK_TYPE_IMPORT_CONTACT:
          if (parsedUrl.query.data) {
            void handleImportDeepContact(parsedUrl.query.data)()
          }
          break
        default:
          reportError('warn', 'Unknown deep link type', {url})
      }
    },
    [handleImportDeepContact]
  )

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link) {
          onLinkReceived(link)
        }
      })
      .catch((err) => {
        reportError('warn', 'Error while opening deep link', err)
        Alert.alert(t('common.errorOpeningLink.message'))
      })
    return dynamicLinks().onLink((link) => {
      if (link) {
        onLinkReceived(link)
      }
    })
  }, [onLinkReceived, t])
}
