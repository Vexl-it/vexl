import {useState} from 'react'
import {Image, TouchableOpacity} from 'react-native'
import {Stack, Text, XStack} from 'tamagui'
import bigNameSvg from '../../../../images/bigNameSvg'
import {type LoginStackScreenProps} from '../../../../navigationTypes'
import {useTranslation} from '../../../../utils/localization/I18nProvider'
import SVGImage from '../../../Image'
import {
  HeaderProxy,
  NextButtonProxy,
} from '../../../PageWithButtonAndProgressHeader'
import Switch from '../../../Switch'
import WhiteContainer from '../../../WhiteContainer'
import notepadSvg from './images/notepadSvg'

type Props = LoginStackScreenProps<'Start'>

function StartScreen({navigation}: Props): JSX.Element {
  const [touAgree, setTOUAgree] = useState(false)

  const {t} = useTranslation()

  return (
    <Stack f={1} bg="$darkColorText">
      <HeaderProxy showBackButton={true} progressNumber={undefined} />
      <WhiteContainer>
        <Stack f={1} ai="center">
          <Stack f={1}>
            <Image
              style={{flex: 1}}
              resizeMode="contain"
              source={require('../../../../images/logo.png')}
            />
          </Stack>
          <Stack mb="$5">
            <SVGImage width={211} height={66} source={bigNameSvg} />
          </Stack>
          <Text fos={18} ff="$body500" col="$greyOnBlack">
            {t('loginFlow.start.subtitle')}
          </Text>
        </Stack>
      </WhiteContainer>
      <XStack ai="center" py="$4" px="$5" br="$5" my="$3" bc="$backgroundBlack">
        <XStack ai="center" space="$2">
          <SVGImage source={notepadSvg} />
          <XStack f={1} ai="center" jc="space-between">
            <XStack fs={1} ai="center" fw="wrap">
              <Text fos={18} ff="$body500" col="$greyOnBlack">
                {t('loginFlow.start.touLabel')}{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('TermsAndConditions')
                }}
              >
                <Text fontSize={18} ff="$body600" col="$white">
                  {t('loginFlow.start.termsOfUse')}
                </Text>
              </TouchableOpacity>
            </XStack>
            <Switch value={touAgree} onValueChange={setTOUAgree} />
          </XStack>
        </XStack>
      </XStack>
      <NextButtonProxy
        disabled={!touAgree}
        onPress={() => {
          navigation.navigate('PhoneNumber')
        }}
        text={t('common.continue')}
      />
    </Stack>
  )
}

export default StartScreen
