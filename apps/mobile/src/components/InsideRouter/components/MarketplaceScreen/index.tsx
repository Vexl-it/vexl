import ContainerWithTopBorderRadius, {
  CONTAINER_WITH_TOP_BORDER_RADIUS_TOP_PADDING,
} from '../ContainerWithTopBorderRadius'
import {type MarketplaceTabParamsList} from '../../../../navigationTypes'
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import OffersListWithFilter from './components/OffersListStateDisplayer'
import {useTranslation} from '../../../../utils/localization/I18nProvider'
import {OfferType} from '@vexl-next/domain/dist/general/offers'
import {useTriggerOffersRefresh} from '../../../../state/marketplace'
import {useCallback, useMemo} from 'react'
import {type StyleProp, type ViewStyle} from 'react-native'
import {getTokens, useMedia} from 'tamagui'
import {useAppState} from '../../../../utils/useAppState'
import {useSetAtom} from 'jotai'
import {setOffersFilterAtom} from '../../../FilterOffersScreen/atom'

const Tab = createMaterialTopTabNavigator<MarketplaceTabParamsList>()

function MarketplaceScreen(): JSX.Element {
  const {t} = useTranslation()
  const media = useMedia()
  const tokens = getTokens()
  const setOffersFilter = useSetAtom(setOffersFilterAtom)

  const tabBarStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      marginTop: CONTAINER_WITH_TOP_BORDER_RADIUS_TOP_PADDING,
      backgroundColor: tokens.color.black.val,
      borderBottomColor: tokens.color.grey.val,
      borderBottomWidth: 2,
    }),
    [tokens.color.black.val, tokens.color.grey.val]
  )

  const tabBarContentContainerStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      margin: 0,
      padding: 0,
    }),
    []
  )

  const tabBarLabelStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      fontSize: media.sm ? 30 : 40,
      fontFamily: 'PPMonument',
      textTransform: 'none',
      margin: 0,
    }),
    [media]
  )

  const tabBarIndicatorStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      height: 2,
      bottom: -2,
    }),
    []
  )

  const refreshOffers = useTriggerOffersRefresh()

  useAppState(
    useCallback(
      (state) => {
        if (state === 'active') setOffersFilter()
        if (state === 'active') void refreshOffers()
      },
      [refreshOffers, setOffersFilter]
    )
  )

  return (
    <ContainerWithTopBorderRadius>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle,
          tabBarContentContainerStyle,
          tabBarLabelStyle,
          tabBarActiveTintColor: tokens.color.main.val,
          tabBarInactiveTintColor: tokens.color.greyOnBlack.val,
          tabBarIndicatorStyle,
        }}
      >
        <Tab.Screen
          name="Sell"
          options={{tabBarLabel: t('offer.sell')}}
          initialParams={{type: OfferType.parse('SELL')}}
          component={OffersListWithFilter}
        />
        <Tab.Screen
          name="Buy"
          options={{tabBarLabel: t('offer.buy')}}
          initialParams={{type: OfferType.parse('BUY')}}
          component={OffersListWithFilter}
        />
      </Tab.Navigator>
    </ContainerWithTopBorderRadius>
  )
}

export default MarketplaceScreen
