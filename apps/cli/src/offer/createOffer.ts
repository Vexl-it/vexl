import {pipe} from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import {
  type IntendedConnectionLevel,
  OfferPublicPart,
} from '@vexl-next/domain/dist/general/offers'
import {getPrivateApiFromCredentialsJsonString} from '../api'
import {
  generatePrivateKey,
  type PublicKeyPemBase64,
} from '@vexl-next/cryptography/dist/KeyHolder'
import {
  parseJson,
  safeParse,
  stringifyToPrettyJson,
} from '@vexl-next/resources-utils/dist/utils/parsing'
import {parseCredentialsJson} from '../utils/auth'
import createNewOfferForMyContacts from '@vexl-next/resources-utils/dist/offers/createOfferHandleContacts'
import {CountryPrefix} from '@vexl-next/domain/dist/general/CountryPrefix.brand'

function readPublicPartFromFile(offerPublicKey: PublicKeyPemBase64) {
  return (json: string) =>
    pipe(
      json,
      parseJson,
      // set proper public key
      E.map(
        (offer) =>
          ({
            ...offer,
            offerPublicKey,
          } as OfferPublicPart)
      ),
      E.chainW(safeParse(OfferPublicPart))
    )
}

export default function createOffer({
  intendedConnectionLevel,
  credentialsJson,
  offerPayloadJson,
}: {
  credentialsJson: string
  intendedConnectionLevel: IntendedConnectionLevel
  offerPayloadJson: string
}) {
  return pipe(
    TE.Do,
    TE.bindW('credentials', () =>
      TE.fromEither(parseCredentialsJson(credentialsJson))
    ),
    TE.bindW('api', () =>
      pipe(
        credentialsJson,
        getPrivateApiFromCredentialsJsonString,
        TE.fromEither
      )
    ),
    TE.bindW('offerInboxCredentials', () => TE.right(generatePrivateKey())),
    TE.chainFirstW(({api, offerInboxCredentials}) =>
      api.chat.createInbox({keyPair: offerInboxCredentials})
    ),
    TE.bindW('offerPublicPart', ({offerInboxCredentials}) =>
      pipe(
        offerPayloadJson,
        readPublicPartFromFile(offerInboxCredentials.publicKeyPemBase64),
        TE.fromEither
      )
    ),
    TE.bindW(
      'createdOffer',
      ({offerInboxCredentials, offerPublicPart, api, credentials}) =>
        createNewOfferForMyContacts({
          offerApi: api.offer,
          ownerKeyPair: credentials.keypair,
          intendedConnectionLevel,
          countryPrefix: CountryPrefix.parse(420),
          contactApi: api.contact,
          publicPart: offerPublicPart,
        })
    ),
    TE.map(
      ({
        credentials,
        offerInboxCredentials,
        offerPublicPart,
        createdOffer,
      }) => ({
        ...createdOffer,
        inboxKeyPair: offerInboxCredentials,
        ownerCredentials: credentials,
      })
    ),
    TE.chainEitherKW(stringifyToPrettyJson)
  )
}
