import pkg from '../package.json'
import got from 'got'

export const BASE_URL = 'https://www.firmensms.at/gateway/'
export const SEND_URL = BASE_URL + 'senden.php'

const requestOptions = {
  json: true,
  headers: {
    'user-agent': `firmensms/${pkg.version} (javascript; https://www.npmjs.com/package/firmensms)`
  }
}

export const callSend = (query) => {
  const options = {
    ...requestOptions,
    query
  }

  return got(SEND_URL, options)
    .then((res) => res.body)
}
