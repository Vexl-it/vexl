import {type BtcOrSat} from '@vexl-next/domain/src/general/tradeChecklist'
import {useAtomValue, useSetAtom, type PrimitiveAtom} from 'jotai'
import {useRef, useState} from 'react'
import {StyleSheet, type TextInput} from 'react-native'
import {Stack, getTokens} from 'tamagui'
import {SATOSHIS_IN_BTC} from '../../../../../state/currentBtcPriceAtoms'
import {Dropdown, type DropdownItemProps} from '../../../../Dropdown'
import {replaceNonDecimalCharsInInput} from '../../../utils'
import {
  btcOrSatAtom,
  calculateFiatValueOnBtcAmountChangeActionAtom,
  switchBtcOrSatValueActionAtom,
} from '../atoms'
import AmountInput from './AmountInput'
import CalculatedWithLiveRate from './CalculatedWithLiveRate'

const styles = StyleSheet.create({
  dropdown: {
    width: 65,
  },
  dropdownContainerStyle: {
    backgroundColor: getTokens().color.greyAccent1.val,
    borderRadius: getTokens().radius[4].val,
    width: 100,
    borderWidth: 0,
    paddingTop: 10,
    paddingBottom: 10,
  },
  dropdownItemContainerStyle: {
    borderRadius: getTokens().radius[4].val,
  },
  selectedTextStyle: {
    color: getTokens().color.white.val,
    fontWeight: '500',
    fontSize: 18,
    fontFamily: 'TTSatoshi500',
  },
})

const btcOrSatOptions: BtcOrSat[] = ['BTC', 'SAT']
const BTC_INPUT_PLACEHOLDER = '1'
const SATS_INPUT_PLACEHOLDER = `${SATOSHIS_IN_BTC}`

interface Props {
  automaticCalculationDisabled?: boolean
  editable?: boolean
  btcValueAtom: PrimitiveAtom<string>
}

const btcOrSatDropdownData: Array<DropdownItemProps<BtcOrSat>> =
  btcOrSatOptions.map((option) => ({
    label: option,
    value: option,
  }))

function BtcAmountInput({
  automaticCalculationDisabled,
  btcValueAtom,
  editable = true,
}: Props): JSX.Element {
  const ref = useRef<TextInput>(null)
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const btcValue = useAtomValue(btcValueAtom)
  const btcOrSat = useAtomValue(btcOrSatAtom)
  const switchBtcOrSatValue = useSetAtom(switchBtcOrSatValueActionAtom)
  const calculateFiatValueOnBtcAmountChange = useSetAtom(
    calculateFiatValueOnBtcAmountChangeActionAtom
  )

  return (
    <AmountInput
      ref={ref}
      editable={editable}
      isFocused={isFocused}
      onBlur={() => {
        setIsFocused(false)
      }}
      onFocus={() => {
        setIsFocused(true)
      }}
      onWrapperPress={() => {
        ref.current?.focus()
      }}
      placeholder={
        btcOrSat === 'BTC' ? BTC_INPUT_PLACEHOLDER : SATS_INPUT_PLACEHOLDER
      }
      value={btcValue}
      onChangeText={(input) => {
        calculateFiatValueOnBtcAmountChange({
          automaticCalculationDisabled,
          btcAmount: replaceNonDecimalCharsInInput(input),
        })
      }}
    >
      <Stack>
        <Dropdown
          disable={!editable}
          value={{value: btcOrSat, label: btcOrSat}}
          data={btcOrSatDropdownData}
          onChange={(item) => {
            switchBtcOrSatValue(item.value)
          }}
          style={styles.dropdown}
          containerStyle={styles.dropdownContainerStyle}
          itemContainerStyle={styles.dropdownItemContainerStyle}
          selectedTextStyle={styles.selectedTextStyle}
        />
        {!isFocused && !!btcValue && !automaticCalculationDisabled && (
          <CalculatedWithLiveRate />
        )}
      </Stack>
    </AmountInput>
  )
}

export default BtcAmountInput
