import querystring from 'querystring'

export const optionToParamMapping = {
  user: 'id',
  route: 'route',
  to: 'nummer',
  from: 'absender',
  date: 'datum',
  statusReport: 'statusbericht',
  statusReportServer: 'dlr_server',
  validity: 'gueltigkeit'
}

export const booleanOptions = [
  'test',
  'statusReport'
]

export const optionToParam = (key) => {
  return optionToParamMapping[key] || key
}

export const translateRegularOptions = (options) => {
  let query = {}

  Object.keys(options).map((key) => {
    query[optionToParam(key)] = options[key]
  })

  return query
}

export const translateBooleanOptions = (options) => {
  let newOptions = { ...options }

  booleanOptions.map((key) => {
    if (Object.keys(newOptions).includes(key)) {
      if (newOptions[key]) {
        newOptions[key] = '1'
      } else {
        newOptions[key] = '0'
      }
    }
  })

  return newOptions
}

export const translateSpecialOptions = (options) => {
  let newOptions = { ...options }

  if (newOptions.json) {
    newOptions.response = 'json'
    delete newOptions.json
  }

  if (newOptions.flash) {
    newOptions.type = 'flash'
    delete newOptions.flash
  }

  return newOptions
}

export const buildQuery = (options) => {
  const withSpecial = translateSpecialOptions(options)
  const withRegular = translateRegularOptions(withSpecial)
  const queryObject = translateBooleanOptions(withRegular)
  return querystring.stringify(queryObject)
}
