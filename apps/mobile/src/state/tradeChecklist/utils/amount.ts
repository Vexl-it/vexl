import {type AmountData} from '@vexl-next/domain/src/general/tradeChecklist'
import {UnixMilliseconds0} from '@vexl-next/domain/src/utility/UnixMilliseconds.brand'
import fastDeepEqual from 'fast-deep-equal'
import calculatePercentageDifference from '../../../utils/calculatePercentageDifference'
import {type TradeChecklistInState} from '../domain'

type AmountInState = TradeChecklistInState['amount']

interface AmountDataToDisplay {
  by: 'me' | 'them'
  amountData: AmountData
  status: 'accepted' | 'pending'
}

export function getAmountData(
  data: AmountInState
): AmountDataToDisplay | undefined {
  const sentAmountData = data.sent
  const receivedAmountData = data.received
  const sentTimestamp = data.sent?.timestamp ?? UnixMilliseconds0
  const receivedTimestamp = data.received?.timestamp ?? UnixMilliseconds0
  const {timestamp: tsSent, ...sentDataNoTimestamp} = {...sentAmountData}
  const {timestamp: tsReceived, ...receivedDataNoTimestamp} = {
    ...receivedAmountData,
  }
  const status = fastDeepEqual(sentDataNoTimestamp, receivedDataNoTimestamp)
    ? 'accepted'
    : 'pending'

  if (sentTimestamp > receivedTimestamp && sentAmountData) {
    return {
      by: 'me',
      amountData: sentAmountData,
      status,
    }
  }
  if (receivedTimestamp > sentTimestamp && receivedAmountData) {
    return {
      by: 'them',
      amountData: {
        ...receivedAmountData,
        tradePriceType:
          receivedAmountData.tradePriceType === 'your'
            ? 'custom'
            : receivedAmountData.tradePriceType,
      },
      status,
    }
  }

  return undefined
}

export function calculateBtcPricePercentageDifference(
  amountDataToDisplay: AmountDataToDisplay | undefined,
  currentBtcPrice: number | undefined
): number {
  if (
    amountDataToDisplay?.by === 'them' &&
    amountDataToDisplay.amountData.btcPrice &&
    (amountDataToDisplay.amountData.tradePriceType === 'custom' ||
      amountDataToDisplay.amountData.tradePriceType === 'frozen')
  ) {
    return calculatePercentageDifference(
      amountDataToDisplay.amountData.btcPrice,
      currentBtcPrice
    )
  }

  return 0
}

export function amountSettled(data: AmountInState): boolean {
  return getAmountData(data)?.status === 'accepted'
}

export function amountPending(data: AmountInState): boolean {
  return getAmountData(data)?.status === 'pending'
}
