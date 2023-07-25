import {type RootStackScreenProps} from '../../../navigationTypes'
import {useTranslation} from '../../../utils/localization/I18nProvider'
import Screen from '../../Screen'
import KeyboardAvoidingView from '../../KeyboardAvoidingView'
import React, {useCallback, useMemo} from 'react'
import {singleOfferAtom} from '../../../state/marketplace/atom'
import {useAtomValue, useSetAtom} from 'jotai'
import {Stack, Text} from 'tamagui'
import useSafeGoBack from '../../../utils/useSafeGoBack'
import {ScrollView, StyleSheet} from 'react-native'
import OfferForm from '../../OfferForm'
import Button from '../../Button'
import {pipe} from 'fp-ts/function'
import * as T from 'fp-ts/Task'
import OfferInProgress from './OfferInProgress'
import {useFocusEffect} from '@react-navigation/native'
import {useMolecule} from 'jotai-molecules'
import {offerFormMolecule} from '../atoms/offerFormStateAtoms'
import useContent from '../useContent'
import EditOfferHeader from './EditOfferHeader'

const styles = StyleSheet.create({
  contentStyles: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
})

type Props = RootStackScreenProps<'EditOffer'>

function EditOfferScreen({
  route: {
    params: {offerId},
  },
}: Props): JSX.Element {
  const {t} = useTranslation()
  const safeGoBack = useSafeGoBack()
  const content = useContent()

  const {offerAtom, editOfferAtom} = useMolecule(offerFormMolecule)
  const editOffer = useSetAtom(editOfferAtom)
  const setOffer = useSetAtom(offerAtom)
  const offer = useAtomValue(useMemo(() => singleOfferAtom(offerId), [offerId]))

  useFocusEffect(
    useCallback(() => {
      if (offer) setOffer(offer)
    }, [offer, setOffer])
  )

  return (
    <Screen customHorizontalPadding={0} customVerticalPadding={32}>
      <KeyboardAvoidingView>
        <>
          <ScrollView contentContainerStyle={styles.contentStyles}>
            <EditOfferHeader offer={offer} />
            {offer ? (
              <OfferForm content={content} />
            ) : (
              <Stack f={1} ai={'center'}>
                <Text ff={'$heading'} fos={16} col={'$white'}>
                  {t('editOffer.errorOfferNotFound')}
                </Text>
              </Stack>
            )}
          </ScrollView>
          {offer && (
            <Stack px="$4" py="$4" bc="transparent">
              <Button
                text={t('editOffer.saveChanges')}
                onPress={() => {
                  void pipe(
                    editOffer(),
                    T.map((success) => {
                      if (success) {
                        safeGoBack()
                      }
                    })
                  )()
                }}
                variant="secondary"
              />
            </Stack>
          )}
          <OfferInProgress
            loadingTitle={t('editOffer.editingYourOffer')}
            loadingDoneTitle={t('editOffer.offerEditSuccess')}
            loadingSubtitle={t('editOffer.pleaseWait')}
            loadingDoneSubtitle={t('editOffer.youCanCheckYourOffer')}
          />
        </>
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default EditOfferScreen
