import { validateOptions } from './validate'
import { buildQuery } from './query'
import { callSend } from './request'
import { transformResponse } from './transformResponse'

export const send = (options) => {
  return new Promise((resolve) => {
    const validatedOptions = validateOptions(options)
    const query = buildQuery(validatedOptions)
    resolve(query)
  }).then(callSend).then(transformResponse)
}

export default class Firmensms {
  constructor (user, pass) {
    if (!user || !pass) {
      throw new Error('Please provide your user ID and an application-specific password')
    }
    this.user = user
    this.pass = pass
  }

  send (options) {
    return send({
      user: this.user,
      pass: this.pass,
      ...options
    })
  }
}
