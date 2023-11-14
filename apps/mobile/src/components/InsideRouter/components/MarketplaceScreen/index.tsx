import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import {OfferType} from '@vexl-next/domain/dist/general/offers'
import {useSetAtom} from 'jotai'
import {useCallback, useMemo} from 'react'
import {getTokens, useMedia} from 'tamagui'
import {type MarketplaceTabParamsList} from '../../../../navigationTypes'
import {triggerOffersRefreshAtom} from '../../../../state/marketplace'
import {
  getCurrentLocale,
  useTranslation,
} from '../../../../utils/localization/I18nProvider'
import {useAppState} from '../../../../utils/useAppState'
import ContainerWithTopBorderRadius, {
  CONTAINER_WITH_TOP_BORDER_RADIUS_TOP_PADDING,
} from '../ContainerWithTopBorderRadius'
import OffersListWithFilter from './components/OffersListStateDisplayer'

const Tab = createMaterialTopTabNavigator<MarketplaceTabParamsList>()

const tabsFontSizes: Record<string, {sm: number; md: number; lg: number}> = {
  default: {
    sm: 30,
    md: 40,
    lg: 40,
  },
  de: {sm: 20, md: 20, lg: 25},
  cs: {sm: 25, md: 30, lg: 30},
  sk: {sm: 25, md: 30, lg: 30},
}

function MarketplaceScreen(): JSX.Element {
  const {t} = useTranslation()
  const media = useMedia()
  const tokens = getTokens()

  const {
    tabBarStyle,
    tabBarContentContainerStyle,
    tabBarLabelStyle,
    tabBarIndicatorStyle,
  } = useMemo(() => {
    const tabLabelFontSize = (() => {
      const sizesForLangauge =
        tabsFontSizes[getCurrentLocale().split('-').at(0) ?? 'default'] ??
        tabsFontSizes.default

      if (media.sm) return sizesForLangauge?.sm
      if (media.md) return sizesForLangauge?.md
      if (media.lg) return sizesForLangauge?.lg
    })()

    return {
      tabBarStyle: {
        marginTop: CONTAINER_WITH_TOP_BORDER_RADIUS_TOP_PADDING,
        backgroundColor: tokens.color.black.val,
        borderBottomColor: tokens.color.grey.val,
        borderBottomWidth: 2,
      },
      tabBarContentContainerStyle: {
        margin: 0,
        padding: 0,
      },
      tabBarLabelStyle: {
        fontSize: tabLabelFontSize,
        fontFamily: 'PPMonument',
        textTransform: 'none',
        margin: 0,
      },
      tabBarIndicatorStyle: {
        height: 2,
        bottom: -2,
      },
    } as const
  }, [tokens.color.black.val, tokens.color.grey.val, media])

  const refreshOffers = useSetAtom(triggerOffersRefreshAtom)

  useAppState(
    useCallback(
      (state) => {
        if (state === 'active') {
          void refreshOffers()
        }
      },
      [refreshOffers]
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
          options={{
            tabBarLabel: t('offer.sell'),
          }}
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
