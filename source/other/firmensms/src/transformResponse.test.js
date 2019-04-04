/* eslint-env mocha */
import { expect } from 'chai'
import {
  transformResponse
} from './transformResponse'

describe('transformResponse', function () {
  it('handles successful response', function () {
    const successfulResponse = {
      error: '0',
      nummer: '0043671234567',
      msgid: '123456789',
      rechnungssumme: '10.13',
      guthaben: '10.13',
      transaktionskosten: '0.07'
    }

    expect(transformResponse(successfulResponse)).to.eql({
      to: '0043671234567',
      messageId: '123456789',
      invoiceSum: '10.13',
      credits: '10.13',
      transactionCost: '0.07',
      response: successfulResponse
    })
  })

  it('handles error response', function () {
    const errorResponse = {
      error: '10'
    }

    expect(() => transformResponse(errorResponse)).to.throw()
  })
})
