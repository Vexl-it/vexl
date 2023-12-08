import {molecule} from 'jotai-molecules'
import {atom, type PrimitiveAtom} from 'jotai'
import {type FileSystemError} from '../utils/internalStorage'
import {
  getImageFromCameraAndTryToResolveThePermissionsAlongTheWay,
  getImageFromGalleryAndTryToResolveThePermissionsAlongTheWay,
  type ImagePickerError,
} from '../utils/imagePickers'
import {translationAtom} from '../utils/localization/I18nProvider'
import reportError from '../utils/reportError'
import * as O from 'fp-ts/Option'
import {type UriString} from '@vexl-next/domain/dist/utility/UriString.brand'
import getValueFromSetStateActionOfAtom from '../utils/atomUtils/getValueFromSetStateActionOfAtom'
import {Alert} from 'react-native'
import {pipe} from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import showErrorAlert from '../utils/showErrorAlert'
import {realUserDataAtom} from './session'

export const changeProfilePictureMolecule = molecule(() => {
  const reportAndTranslateErrorsAtom = atom<
    null,
    [{error: FileSystemError | ImagePickerError}],
    string
  >(null, (get, set, params) => {
    const {error} = params
    const {t} = get(translationAtom)

    if (error._tag === 'imagePickerError') {
      switch (error.reason) {
        case 'PermissionsNotGranted':
          return t('loginFlow.photo.permissionsNotGranted')
        case 'NothingSelected':
          return t('loginFlow.photo.nothingSelected')
      }
    }
    reportError('error', 'Unexpected error while picking image', error)
    return t('common.unknownError') // how is it that linter needs this line
  })

  const didImageUriChangeAtom = atom<boolean>(false)

  const _selectedImageUriAtom = atom<O.Option<UriString> | undefined>(undefined)

  const selectedImageUriAtom: PrimitiveAtom<O.Option<UriString>> = atom(
    (get) => {
      const selectImageUri = get(_selectedImageUriAtom)
      const userImage = get(realUserDataAtom)?.image?.imageUri
      return selectImageUri ?? O.fromNullable(userImage)
    },
    (get, set, update) => {
      const newValue = getValueFromSetStateActionOfAtom(update)(() =>
        get(selectedImageUriAtom)
      )
      set(_selectedImageUriAtom, newValue)
    }
  )

  const syncImageWithSessionUriAtom = atom(null, (get, set) => {
    set(
      _selectedImageUriAtom,
      O.fromNullable(get(realUserDataAtom)?.image?.imageUri)
    )
    set(didImageUriChangeAtom, false)
  })

  const selectImageActionAtom = atom<null, [], O.Option<UriString>>(
    null,
    (get, set) => {
      const {t} = get(translationAtom)

      Alert.alert(t('loginFlow.photo.selectSource'), undefined, [
        {
          text: t('loginFlow.photo.gallery'),
          onPress: () => {
            void pipe(
              getImageFromGalleryAndTryToResolveThePermissionsAlongTheWay({
                saveTo: 'documents',
                aspect: [1, 1],
              }),
              TE.match(
                (e) => {
                  showErrorAlert({
                    title: set(reportAndTranslateErrorsAtom, {error: e}),
                    error: e,
                  })
                },
                (r) => {
                  set(selectedImageUriAtom, O.some(r.uri))
                  set(didImageUriChangeAtom, true)
                }
              )
            )()
          },
        },
        {
          text: t('loginFlow.photo.camera'),
          onPress: () => {
            void pipe(
              getImageFromCameraAndTryToResolveThePermissionsAlongTheWay({
                saveTo: 'documents',
                aspect: [1, 1],
              }),
              TE.match(
                (e) => {
                  showErrorAlert({
                    title: set(reportAndTranslateErrorsAtom, {error: e}),
                    error: e,
                  })
                },
                (r) => {
                  set(selectedImageUriAtom, O.some(r.uri))
                  set(didImageUriChangeAtom, true)
                }
              )
            )()
          },
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ])

      return O.none
    }
  )

  return {
    syncImageActionAtom: syncImageWithSessionUriAtom,
    didImageUriChangeAtom,
    selectedImageUriAtom,
    selectImageActionAtom,
  }
})
