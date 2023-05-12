import useContent from './useContent'
import SelectableCell from '../SelectableCell'
import {type BtcNetwork} from '@vexl-next/domain/dist/general/offers'
import {useAtom} from 'jotai'
import {YStack} from 'tamagui'
import {useMolecule} from 'jotai-molecules'
import {offerFormStateMolecule} from '../../atoms/offerFormStateAtoms'

function Network(): JSX.Element {
  const content = useContent()
  const {btcNetworkAtom} = useMolecule(offerFormStateMolecule)
  const [btcNetwork, setBtcNetwork] = useAtom(btcNetworkAtom)

  const onNetworkSelect = (type: BtcNetwork): void => {
    if (btcNetwork.includes(type) && btcNetwork.length > 1) {
      const selectedNetworks = btcNetwork.filter((method) => method !== type)
      setBtcNetwork(selectedNetworks)
    } else if (!btcNetwork.includes(type)) {
      setBtcNetwork([...btcNetwork, type])
    }
  }
  return (
    <YStack space="$2">
      {content.map((cell) => (
        <SelectableCell
          key={cell.type}
          selected={btcNetwork.includes(cell.type)}
          onPress={onNetworkSelect}
          title={cell.title}
          subtitle={cell.subtitle}
          type={cell.type}
        />
      ))}
    </YStack>
  )
}

export default Network
