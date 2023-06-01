import * as E from 'fp-ts/Either'
import type * as TE from 'fp-ts/TaskEither'
import * as ImagePicker from 'expo-image-picker'
import {UriString} from '@vexl-next/domain/dist/utility/UriString.brand'
import * as FileSystem from 'expo-file-system'
import {pipe} from 'fp-ts/function'
import {safeParse} from '../../../../utils/fpUtils'
import urlJoin from 'url-join'
import {generateUuid} from '@vexl-next/domain/dist/utility/Uuid.brand'

export interface ImagePickerError {
  _tag: 'imagePickerError'
  reason: 'PermissionsNotGranted' | 'UnknownError' | 'NothingSelected'
  error?: unknown
}

async function moveImageToDocumentDirectory(
  imagePath: string
): Promise<string> {
  const documentDir = FileSystem.documentDirectory
  if (!documentDir) throw new Error('document dir not found')

  const path = urlJoin(
    documentDir,
    `profilePicture-${generateUuid()}-.${imagePath.split('.').at(-1) ?? 'jpeg'}`
  )

  await FileSystem.copyAsync({from: imagePath, to: path})
  return path
}

export function getImageFromCameraAndTryToResolveThePermissionsAlongTheWay(): TE.TaskEither<
  ImagePickerError,
  UriString
> {
  return async () => {
    try {
      const cameraPermissions =
        await ImagePicker.requestCameraPermissionsAsync()
      if (!cameraPermissions.granted && cameraPermissions.canAskAgain) {
        return E.left({
          _tag: 'imagePickerError',
          reason: 'PermissionsNotGranted',
        })
      }
      if (!cameraPermissions.granted) {
        const permissionsResult = await ImagePicker.getCameraPermissionsAsync()
        if (!permissionsResult.granted)
          return E.left({
            _tag: 'imagePickerError',
            reason: 'PermissionsNotGranted',
          })
      }
      const {assets, canceled} = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        allowsMultipleSelection: false,
      })

      if (canceled)
        return E.left({_tag: 'imagePickerError', reason: 'NothingSelected'})
      const selectedImage = assets?.[0]

      if (!selectedImage?.uri)
        return E.left({
          _tag: 'imagePickerError',
          reason: 'UnknownError',
          error: new Error('Uri of the selected image is null'),
        })

      return pipe(
        safeParse(UriString)(
          await moveImageToDocumentDirectory(selectedImage.uri)
        ),
        E.mapLeft((error) => ({
          _tag: 'imagePickerError',
          reason: 'UnknownError',
          error,
        }))
      )
    } catch (error) {
      return E.left({_tag: 'imagePickerError', reason: 'UnknownError', error})
    }
  }
}

export function getImageFromGalleryAndTryToResolveThePermissionsAlongTheWay(): TE.TaskEither<
  ImagePickerError,
  UriString
> {
  return async () => {
    try {
      const libraryPermissions =
        await ImagePicker.getMediaLibraryPermissionsAsync(true)
      if (!libraryPermissions.granted && !libraryPermissions.canAskAgain) {
        return E.left({
          _tag: 'imagePickerError',
          reason: 'PermissionsNotGranted',
        })
      }
      if (!libraryPermissions.granted) {
        const permissionsResult =
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permissionsResult.granted)
          return E.left({
            _tag: 'imagePickerError',
            reason: 'PermissionsNotGranted',
          })
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
        allowsMultipleSelection: false,
      })

      if (result.canceled)
        return E.left({_tag: 'imagePickerError', reason: 'NothingSelected'})
      const selectedImage = result.assets?.[0]

      if (!selectedImage?.uri)
        return E.left({
          _tag: 'imagePickerError',
          reason: 'UnknownError',
          error: new Error('Uri of the selected image is null'),
        })

      return pipe(
        safeParse(UriString)(
          await moveImageToDocumentDirectory(selectedImage.uri)
        ),
        E.mapLeft((error) => ({
          _tag: 'imagePickerError',
          reason: 'UnknownError',
          error,
        }))
      )
    } catch (error) {
      return E.left({_tag: 'imagePickerError', reason: 'UnknownError', error})
    }
  }
}
