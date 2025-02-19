import {Brand, Schema} from 'effect'
import {DateTime} from 'luxon'
import {z} from 'zod'
import {type UnixMilliseconds} from './UnixMilliseconds.brand'

export const IsoDatetimeString = z
  .custom<string>((isoString) => DateTime.fromISO(String(isoString)).isValid)
  .transform((v) =>
    Brand.nominal<typeof v & Brand.Brand<'IsoDatetimeString'>>()(v)
  )
export type IsoDatetimeString = z.TypeOf<typeof IsoDatetimeString>

export const IsoDatetimeStringE = Schema.String.pipe(
  Schema.filter((isoString) => DateTime.fromISO(String(isoString)).isValid),
  Schema.brand('IsoDatetimeString')
)
export type IsoDatetimeStringE = Schema.Schema.Type<typeof IsoDatetimeStringE>

export const MINIMAL_DATE = IsoDatetimeString.parse('1970-01-01T00:00:00.000Z')

export function isoNow(): IsoDatetimeString {
  return IsoDatetimeString.parse(DateTime.now().toISO())
}

export function fromMilliseconds(
  milliseconds: UnixMilliseconds
): IsoDatetimeString {
  return IsoDatetimeString.parse(DateTime.fromMillis(milliseconds).toISO())
}

export function fromJsDate(date: Date): IsoDatetimeString {
  return IsoDatetimeString.parse(DateTime.fromJSDate(date).toISO())
}
