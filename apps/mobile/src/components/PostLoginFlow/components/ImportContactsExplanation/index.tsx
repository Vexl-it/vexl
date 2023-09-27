import WhiteContainer from '../../../WhiteContainer'
import AnonymizationCaption from '../../../AnonymizationCaption/AnonymizationCaption'
import {useTranslation} from '../../../../utils/localization/I18nProvider'
import {
  HeaderProxy,
  NextButtonProxy,
} from '../../../PageWithButtonAndProgressHeader'
import {type PostLoginFlowScreenProps} from '../../../../navigationTypes'
import {Stack, Text} from 'tamagui'
import {Image} from 'react-native'

type Props = PostLoginFlowScreenProps<'ImportContactsExplanation'>
export default function ImportContactsExplanation({
  navigation,
}: Props): JSX.Element {
  const {t} = useTranslation()

  return (
    <WhiteContainer>
      <Stack f={1} jc="space-between">
        <HeaderProxy showBackButton={false} progressNumber={3} />
        <Stack ai={'center'} flex={1} mb="$4">
          <Image
            style={{height: '100%'}}
            resizeMode={'contain'}
            source={require('./image/importContacts.png')}
          />
        </Stack>
        <Stack jc="space-around">
          <Stack>
            <Text col="$black" mb="$3" fos={24} ff="$heading">
              {t('postLoginFlow.contactsExplanation.title')}
            </Text>
          </Stack>
          <Text fos={16} ff="$body500" mb="$6" col="$greyOnWhite">
            {t('postLoginFlow.contactsExplanation.text')}
          </Text>
          <AnonymizationCaption
            fontSize={16}
            text={t('postLoginFlow.contactsExplanation.anonymizationCaption')}
          />
        </Stack>
        <NextButtonProxy
          text={t('postLoginFlow.importContactsButton')}
          onPress={() => {
            navigation.push('ImportContacts')
          }}
          disabled={false}
        />
      </Stack>
    </WhiteContainer>
  )
}
