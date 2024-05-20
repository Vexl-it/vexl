import MaskedView from '@react-native-masked-view/masked-view'
import {useNavigation} from '@react-navigation/native'
import {LinearGradient} from 'expo-linear-gradient'
import {useStore} from 'jotai'
import React, {useMemo} from 'react'
import {Platform, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import {Stack, XStack, YStack, getTokens} from 'tamagui'
import {type OfferInfo} from '../../../../../packages/domain/src/general/offers'
import chevronRightSvg from '../../images/chevronRightSvg'
import createImportedContactsForHashesAtom from '../../state/contacts/atom/createImportedContactsForHashesAtom'
import Image from '../Image'
import CommonFriendCell from './components/CommonFriendCell'

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
})

interface Props {
  offerInfo: OfferInfo
  variant: 'light' | 'dark'
}

function CommonFriends({offerInfo, variant}: Props): JSX.Element | null {
  const tokens = getTokens()
  const store = useStore()
  const navigation = useNavigation()
  const commonFriends = useMemo(
    () =>
      store.get(
        createImportedContactsForHashesAtom(offerInfo.privatePart.commonFriends)
      ),
    [offerInfo.privatePart.commonFriends, store]
  )

  if (commonFriends.length === 0) return null

  return (
    <YStack space="$2">
      <TouchableOpacity
        disabled={commonFriends.length === 0}
        onPress={() => {
          navigation.navigate('CommonFriends', {
            contactsHashes: offerInfo.privatePart.commonFriends,
          })
        }}
      >
        <XStack
          pos="relative"
          ai="center"
          jc="space-between"
          bc={variant === 'light' ? '$greyAccent5' : '$grey'}
          br="$4"
          px="$4"
          py="$3"
        >
          <Stack fs={1}>
            {Platform.OS === 'ios' ? (
              <MaskedView
                maskElement={
                  <LinearGradient
                    style={styles.linearGradient}
                    colors={['transparent', 'white']}
                    locations={[1, 0.9]}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  />
                }
              >
                <XStack ai="center">
                  {commonFriends.slice(0, 5).map((friend) => (
                    <CommonFriendCell
                      key={friend.computedValues.hash}
                      name={friend.info.name}
                      imageUri={friend.info.imageUri}
                      variant={variant}
                    />
                  ))}
                </XStack>
              </MaskedView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                fadingEdgeLength={100}
              >
                {commonFriends.slice(0, 5).map((friend) => (
                  <CommonFriendCell
                    key={`${friend.computedValues.hash} - ${friend.info.name}`}
                    name={friend.info.name}
                    imageUri={friend.info.imageUri}
                    variant={variant}
                  />
                ))}
              </ScrollView>
            )}
          </Stack>
          {commonFriends.length !== 0 && (
            <Stack ai="flex-end" jc="center">
              <Image
                stroke={tokens.color.greyOnBlack.val}
                source={chevronRightSvg}
              />
            </Stack>
          )}
        </XStack>
      </TouchableOpacity>
    </YStack>
  )
}

export default CommonFriends
