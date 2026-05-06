declare module 'svg-captcha' {
  interface CaptchaObj {
    data: string
    text: string
  }
  interface Options {
    size?: number
    ignoreChars?: string
    noise?: number
    color?: boolean
    background?: string
    width?: number
    height?: number
    fontSize?: number
    charPreset?: string
  }
  function create(options?: Options): CaptchaObj
  function createMathExpr(options?: Options): CaptchaObj
}
