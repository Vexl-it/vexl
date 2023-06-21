import {type Atom, atom, type SetStateAction, type WritableAtom} from 'jotai'
import {atomWithParsedMmkvStorage} from '../../utils/atomUtils/atomWithParsedMmkvStorage'
import {focusAtom} from 'jotai-optics'
import {z} from 'zod'
import {
  type LoadingState,
  type OffersFilter,
  OffersState,
  type OneOfferInState,
} from './domain'
import {
  type OfferFlags,
  type OfferId,
  type Sort,
} from '@vexl-next/domain/dist/general/offers'
import {MINIMAL_DATE} from '@vexl-next/domain/dist/utility/IsoDatetimeString.brand'
import areIncluded from './utils/areIncluded'
import {type ChatOrigin} from '@vexl-next/domain/dist/general/messaging'
import {type FocusAtomType} from '../../utils/atomUtils/FocusAtomType'
import {type OfferAdminId} from '@vexl-next/rest-api/dist/services/offer/contracts'
import {selectAtom, splitAtom} from 'jotai/utils'
import {importedContactsHashesAtom} from '../contacts'
import sortOffers from './utils/sortOffers'
import idsOfRequestedOffersAtom from '../chat/atoms/idsOfRequestedOffersAtom'
import isSomeIn30KmRange from './utils/isIn30KmRadius'

export const addMoreContactsSuggestionVisibleAtom = atom<boolean>(true)
export const resetFilterSuggestionVisibleAtom = atom<boolean>(true)

export const createOfferSuggestionVisibleStorageAtom =
  atomWithParsedMmkvStorage(
    'createOfferSuggestionVisible',
    {
      visible: true,
    },
    z.object({visible: z.boolean().default(true)})
  )

export const createOfferSuggestionVisibleAtom = focusAtom(
  createOfferSuggestionVisibleStorageAtom,
  (o) => o.prop('visible')
)

export const offersStateAtom = atomWithParsedMmkvStorage(
  'offers',
  {
    lastUpdatedAt: MINIMAL_DATE,
    offers: [] as OneOfferInState[],
  },
  OffersState
)
export const offersAtom = focusAtom(offersStateAtom, (optic) =>
  optic.prop('offers')
)

export const offersCountAtom = selectAtom(offersAtom, (offers) => offers.length)

export const offersToSeeInMarketplaceAtom = atom((get) => {
  const importedContactsHashes = get(importedContactsHashesAtom)
  return get(offersAtom).filter(
    (oneOffer) =>
      // only active offers
      oneOffer.offerInfo.publicPart.active &&
      // Not mine offers
      !oneOffer.ownershipInfo &&
      // Not reported offers
      !oneOffer.flags.reported &&
      // Offers that has at least one common contact
      oneOffer.offerInfo.privatePart.commonFriends.some((one) =>
        importedContactsHashes.includes(one)
      )
  )
})

export const offersIdsAtom = focusAtom(offersAtom, (optic) =>
  optic.elems().prop('offerInfo').prop('offerId')
)

export const lastUpdatedAtAtom = focusAtom(offersStateAtom, (optic) =>
  optic.prop('lastUpdatedAt')
)

export const myOffersAtom = focusAtom(offersAtom, (optic) =>
  optic.filter((offer) => !!offer.ownershipInfo?.adminId)
)

export const myOffersSortedAtom = atom((get) => {
  const sortingOptions = get(selectedMyOffersSortingOptionAtom)
  const myOffers = get(myOffersAtom)
  const idsOfRequestedOffers = get(idsOfRequestedOffersAtom)

  return sortOffers(myOffers, sortingOptions, idsOfRequestedOffers)
})

export const myOffersSortedAtomsAtom = splitAtom(myOffersSortedAtom)

export const myActiveOffersAtom = focusAtom(myOffersAtom, (optic) =>
  optic.filter((myOffer) => myOffer.offerInfo.publicPart.active)
)

export const selectedMyOffersSortingOptionAtom = atom<Sort>('NEWEST_OFFER')

export function offersAtomWithFilter(
  filter: OffersFilter
): Atom<OneOfferInState[]> {
  return atom((get) => {
    const offersToSeeInMarketplace = get(offersToSeeInMarketplaceAtom)
    const idsOfRequestedOffers = get(idsOfRequestedOffersAtom)

    const filtered = offersToSeeInMarketplace.filter(
      (offer) =>
        (!filter.currency ||
          filter.currency.includes(offer.offerInfo.publicPart.currency)) &&
        (!filter.location ||
          filter.location.every((one) =>
            isSomeIn30KmRange(one, offer.offerInfo.publicPart.location)
          )) &&
        (!filter.paymentMethod ||
          areIncluded(
            filter.paymentMethod,
            offer.offerInfo.publicPart.paymentMethod
          )) &&
        (!filter.btcNetwork ||
          areIncluded(
            filter.btcNetwork,
            offer.offerInfo.publicPart.btcNetwork
          )) &&
        (!filter.friendLevel ||
          areIncluded(
            filter.friendLevel,
            offer.offerInfo.privatePart.friendLevel
          )) &&
        (!filter.offerType ||
          offer.offerInfo.publicPart.offerType === filter.offerType) &&
        (!filter.amountBottomLimit ||
          offer.offerInfo.publicPart.amountBottomLimit >=
            filter.amountBottomLimit) &&
        (!filter.amountTopLimit ||
          offer.offerInfo.publicPart.amountTopLimit <= filter.amountTopLimit)
    )
    return sortOffers(
      filtered,
      filter.sort ?? 'LOWEST_FEE_FIRST',
      idsOfRequestedOffers
    )
  })
}

export function singleOfferAtom(
  offerId: OfferId | undefined
): FocusAtomType<OneOfferInState | undefined> {
  return focusAtom(offersAtom, (optic) =>
    optic.find((offer) => offer.offerInfo.offerId === offerId)
  )
}

export function createSingleOfferReportedFlagAtom(
  offerId: OfferId | undefined
): WritableAtom<boolean | undefined, [SetStateAction<boolean>], void> {
  return focusAtom(singleOfferAtom(offerId), (optic) =>
    optic.optional().prop('flags').prop('reported')
  )
}

export function singleOfferByAdminIdAtom(
  adminId: OfferAdminId | undefined
): FocusAtomType<OneOfferInState | undefined> {
  return focusAtom(offersAtom, (optic) =>
    optic.find((offer) => offer.ownershipInfo?.adminId === adminId)
  )
}

export function offerFlagsAtom(
  offerId: OfferId
): FocusAtomType<OfferFlags | undefined> {
  return focusAtom(offersAtom, (optic) =>
    optic.find((offer) => offer.offerInfo.offerId === offerId).prop('flags')
  )
}

export const loadingStateAtom = atom<LoadingState>({state: 'initial'})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function offerForChatOriginAtom(chatOrigin: ChatOrigin) {
  return atom((get) => {
    if (chatOrigin.type === 'unknown') return undefined
    return get(singleOfferAtom(chatOrigin.offerId))
  })
}
