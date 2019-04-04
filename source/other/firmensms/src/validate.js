export const isValidPhone = (phoneNo) => {
  return !!(phoneNo && phoneNo.match(/^\d+$/))
}

export const isValidFrom = (phoneNoOrName) => {
  if (!phoneNoOrName) {
    return true
  }

  if (phoneNoOrName.match(/^\d+$/) && phoneNoOrName.length <= 16) {
    return true
  }

  if (phoneNoOrName.match(/^[A-Za-z0-9]{1,11}$/)) {
    return true
  }

  return false
}

export const isValidRouteConstraint = (options) => {
  if (options.from && options.route !== 3 && options.route !== 5) {
    return false
  }

  return true
}

export const isValidText = (options) => {
  return true
}

export const validateFields = (options) => {
  if (!options.user || !options.pass) {
    throw new Error('Please provide your user ID and an application-specific password')
  }

  if (!isValidPhone(options.to)) {
    throw new Error('Phone number "to" is not valid')
  }

  if (!isValidFrom(options.from)) {
    throw new Error('Field "from" is not valid')
  }

  if (!isValidText(options)) {
    throw new Error('Field "text" is not valid')
  }

  return true
}

export const defaultOptions = (options) => {
  return {
    json: true,
    route: 1,
    ...options
  }
}

export const validateConstraints = (options) => {
  if (!isValidRouteConstraint(options)) {
    throw new Error('Route must be set to 3 or 5 when field "from" is set')
  }
  return true
}

export const validateOptions = (options) => {
  if (validateFields(options) && validateConstraints(options)) {
    return defaultOptions(options)
  }
}
