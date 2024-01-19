import {useFocusEffect} from '@react-navigation/native'
import {atom, useSetAtom, type ExtractAtomValue} from 'jotai'
import {useCallback} from 'react'

export interface NextButtonState {
  text: string | null
  onPress: (() => void) | null
  disabled: boolean

  secondButton?: {
    text: string
    onPress: () => void
  }
}

const nextButtonStateAtom = atom<NextButtonState>({
  text: null,
  onPress: () => {},
  disabled: true,
})

export default nextButtonStateAtom

export function useSetNextButtonState(
  set: () => ExtractAtomValue<typeof nextButtonStateAtom>
): void {
  const setNextButton = useSetAtom(nextButtonStateAtom)
  useFocusEffect(
    useCallback(() => {
      setNextButton(set())
    }, [setNextButton, set])
  )
}
