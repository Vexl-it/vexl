import {Schema} from '@effect/schema'
import Axios, {
  AxiosError,
  isAxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
} from 'axios'
import * as TE from 'fp-ts/TaskEither'
import {pipe} from 'fp-ts/function'
import type z from 'zod'
import {
  type BadStatusCodeError,
  type NetworkError,
  type UnexpectedApiResponseError,
  type UnknownError,
} from './Errors'
import {type PlatformName} from './PlatformName'
import {type GetUserSessionCredentials} from './UserSessionCredentials.brand'
import {
  HEADER_CLIENT_VERSION,
  HEADER_CRYPTO_VERSION,
  HEADER_HASH,
  HEADER_PLATFORM,
  HEADER_PUBLIC_KEY,
  HEADER_SIGNATURE,
} from './constants'

const DEFAULT_TIMEOUT_MS = 60_000 // Up timeout to 1 minute

export function axiosCallWithValidation<T extends z.ZodType>(
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig,
  responseValidation: T
): TE.TaskEither<
  UnknownError | BadStatusCodeError | UnexpectedApiResponseError | NetworkError,
  z.output<T>
> {
  return pipe(
    axiosCall(axiosInstance, config),
    TE.chainW((x) => {
      const valid = responseValidation.safeParse(x)
      if (valid.success) return TE.right<never, T>(valid.data)
      return TE.left<UnexpectedApiResponseError>({
        _tag: 'UnexpectedApiResponseError',
        errors: valid.error,
        data: x,
      })
    })
  )
}

export function axiosCallWithValidationSchema<I, O>(
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig,
  responseValidation: Schema.Schema<I, O>
): TE.TaskEither<
  UnknownError | BadStatusCodeError | UnexpectedApiResponseError | NetworkError,
  I
> {
  return pipe(
    axiosCall(axiosInstance, config),
    TE.chainW((x) => {
      const valid = Schema.decodeUnknownEither(responseValidation)(x)
      if (valid._tag === 'Right') return TE.right<never, I>(valid.right)
      return TE.left<UnexpectedApiResponseError>({
        _tag: 'UnexpectedApiResponseError',
        errors: valid.left,
        data: x,
      })
    })
  )
}

function stripSensitiveHeaders(headers: any): unknown {
  if (!headers) return headers

  const {
    [HEADER_HASH]: h,
    [HEADER_PUBLIC_KEY]: pk,
    [HEADER_SIGNATURE]: sig,
    ...rest
  } = headers
  return {
    ...rest,
    [HEADER_HASH]: h != null ? '[stripped]' : undefined,
    [HEADER_PUBLIC_KEY]: pk != null ? '[stripped]' : undefined,
    [HEADER_SIGNATURE]: sig != null ? '[stripped]' : undefined,
  }
}

function stripSensitiveHeadersFromRequest(request?: any): unknown {
  if (!request?.headers) return request

  const headers = stripSensitiveHeaders(request.headers)

  return {
    ...request,
    headers,
  }
}

function stripSensitiveHeadersFromResponse(response?: any): unknown {
  if (!response?.request) return response

  return {
    ...response,
    request: stripSensitiveHeadersFromRequest(response.request),
  }
}

function stripSensitiveHeadersFromError(error?: AxiosError): unknown {
  if (!error) return error
  return {
    ...error,
    request: stripSensitiveHeadersFromRequest(error?.request),
    response: stripSensitiveHeadersFromResponse(error?.response),
  }
}

export function axiosCall(
  axiosInstance: AxiosInstance,
  config: AxiosRequestConfig
): TE.TaskEither<
  UnknownError | BadStatusCodeError | UnexpectedApiResponseError | NetworkError,
  unknown
> {
  return pipe(
    TE.tryCatch(
      async () => await axiosInstance.request(config),
      (error) => {
        if (isAxiosError(error)) {
          if (error.response != null) {
            return {
              _tag: 'BadStatusCodeError',
              response: stripSensitiveHeadersFromResponse(error.response),
            } as BadStatusCodeError
          }
          if (
            [
              AxiosError.ERR_NETWORK,
              AxiosError.ERR_CANCELED,
              AxiosError.ETIMEDOUT,
              AxiosError.ECONNABORTED,
            ].includes(error.code ?? '')
          ) {
            return {
              _tag: 'NetworkError',
              code: error.code,
              error: stripSensitiveHeadersFromError(error),
            } as NetworkError
          }
        }
        return {
          _tag: 'UnknownError',
          error,
        } as UnknownError
      }
    ),
    TE.map((x) => x.data)
  )
}

export type LoggingFunction = (message?: any, ...optionalParams: any[]) => void

function addLoggingInterceptor(
  axiosInstance: AxiosInstance,
  loggingFunction: LoggingFunction
): void {
  axiosInstance.interceptors.request.use((config) => {
    loggingFunction(
      `🌐 ⬆️ Sending request: ${
        config.method?.toUpperCase() ?? '[unknown method]'
      } ${config.baseURL ?? 'none'}${config.url ?? '[unknown url]'}`,
      {
        headers: stripSensitiveHeaders(config.headers),
        data: config.data,
        params: config.params,
        baseURL: config.baseURL,
        url: config.url,
      }
    )

    return config
  })
  axiosInstance.interceptors.response.use(
    (response) => {
      loggingFunction(
        `🌐 ✅  Response received: ${
          response.config.method?.toUpperCase() ?? '[unknown method]'
        } "${response.request.url ?? ''}". Status: ${response.status}`,
        {status: response.status, data: response.data}
      )
      return response
    },
    async (error) => {
      if (!isAxiosError(error)) {
        loggingFunction(
          '🌐 ‼️ Non axios when sending request or receiving response:',
          error
        )
        return
      }
      loggingFunction(
        `🌐 ‼️ Error response received ${
          error.config?.method?.toUpperCase() ?? 'unknown method'
        } "${error.config?.baseURL ?? ''}${
          error.config?.url ?? '[unknown url]'
        }".`,
        {status: error.response?.status, data: error.response?.data}
      )

      return await Promise.reject(error)
    }
  )
}

export function createAxiosInstance(
  platform: PlatformName,
  clientVersion: number,
  axiosConfig?: CreateAxiosDefaults,
  loggingFunction: LoggingFunction | null = console.info
): AxiosInstance {
  const axios = Axios.create({
    timeout: DEFAULT_TIMEOUT_MS,
    ...axiosConfig,
    headers: {
      ...axiosConfig?.headers,
      'User-Agent': `Vexl/${clientVersion} ${platform}`,
      [HEADER_CRYPTO_VERSION]: '2',
      [HEADER_PLATFORM]: platform,
      [HEADER_CLIENT_VERSION]: clientVersion.toString(),
    },
  })
  if (loggingFunction) addLoggingInterceptor(axios, loggingFunction)
  return axios
}

export function createAxiosInstanceWithAuthAndLogging(
  getUserSessionCredentials: GetUserSessionCredentials,
  platform: PlatformName,
  clientVersion: number,
  axiosConfig: CreateAxiosDefaults,
  loggingFunction: LoggingFunction | null = console.info
): AxiosInstance {
  const axiosInstance = createAxiosInstance(
    platform,
    clientVersion,
    axiosConfig,
    loggingFunction
  )

  axiosInstance.interceptors.request.use((config) => {
    const credentials = getUserSessionCredentials()
    config.headers.set(HEADER_PUBLIC_KEY, credentials.publicKey)
    config.headers.set(HEADER_SIGNATURE, credentials.signature)
    config.headers.set(HEADER_HASH, credentials.hash)
    return config
  })

  return axiosInstance
}

export type ExtractLeftTE<T extends TE.TaskEither<any, any>> =
  T extends TE.TaskEither<infer L, unknown> ? L : never
