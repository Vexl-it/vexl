import axios from 'axios'
import {GeocodeResponse, type GeocodeQueryData} from '../brands'
import env from '../environment'

interface GoogleGeocodeResponse {
  results: Array<{
    place_id: string
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
      viewport: {
        northeast: {
          lat: number
          lng: number
        }
        southwest: {
          lat: number
          lng: number
        }
      }
    }
  }>
}

export default async function googleGeocode({
  latitude,
  longitude,
  lang,
}: GeocodeQueryData): Promise<GeocodeResponse | null> {
  const response = await axios.get<GoogleGeocodeResponse>(
    'https://maps.googleapis.com/maps/api/geocode/json',
    {
      params: {
        key: env.GOOGLE_PLACES_API_KEY,
        language: lang,
        result_type: 'locality',
        latlng: `${latitude},${longitude}`,
      },
    }
  )

  const firstHit = response.data.results.at(0)
  if (!firstHit) return null

  return GeocodeResponse.parse({
    placeId: firstHit.place_id,
    // Remove postal code from the start as per #865
    address: firstHit.formatted_address.replace(/^[\d\s]*/, ''),
    latitude: firstHit.geometry.location.lat,
    longitude: firstHit.geometry.location.lng,
    viewport: {
      northeast: {
        latitude: firstHit.geometry.viewport.northeast.lat,
        longitude: firstHit.geometry.viewport.northeast.lng,
      },
      southwest: {
        latitude: firstHit.geometry.viewport.southwest.lat,
        longitude: firstHit.geometry.viewport.southwest.lng,
      },
    },
  } satisfies GeocodeResponse)
}
