export const transformResponse = (response) => {
  const errorCode = parseInt(response.error)

  const success = () => {
    return {
      to: response.nummer,
      messageId: response.msgid,
      invoiceSum: response.rechnungssumme,
      credits: response.guthaben,
      transactionCost: response.transaktionskosten,
      response
    }
  }

  const error = (errorMessage) => {
    throw new Error(`API responded with error code ${errorCode}: ${errorMessage}`)
  }

  switch (errorCode) {
    case 1:
      return error('user id missing')
    case 2:
      return error('password missing')
    case 3:
      return error('text message missing')
    case 4:
      return error('recipient number missing')
    case 5:
      return error('sender missing')
    case 7:
      return error('incorrect password')
    case 8:
      return error('no business account')
    case 9:
      return error('sms could not be accepted, support has been informed')
    case 10:
      return error('sender identificaion invalid')
    case 11:
      return error('you enabled spam detection and this message was flagged as spam')
    case 12:
      return error('sms will be queued and delivered after your defined quiet period')
    case 13:
      return error('sms could not be sent. please try again. support has been informed')
    case 14:
      return error('recipient phone number is invalid')
    case 15:
      return error('ip lock is enabled for your account, and this ip address is not whitelisted')
    case 17:
      return error('sms was not sent because recipient phone number is on opt-out list')
    case 0:
      return success()
    default:
      return error('Unknown error')
  }
}
