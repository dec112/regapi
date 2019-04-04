/* eslint-env mocha */
import { expect } from 'chai'
import {
  isValidPhone,
  isValidFrom,
  isValidRouteConstraint,
  validateFields
} from './validate'

describe('validate', function () {
  describe('isValidPhone', function () {
    it('is required', function () {
      expect(isValidPhone('')).to.equal(false)
    })

    it('rejects letters', function () {
      expect(isValidPhone('abcde')).to.equal(false)
    })

    it('rejects digits with other characters', function () {
      expect(isValidPhone('+12345')).to.equal(false)
      expect(isValidPhone('123 456')).to.equal(false)
    })

    it('accepts only digits', function () {
      expect(isValidPhone('123456789')).to.equal(true)
      expect(isValidPhone('00436761234567')).to.equal(true)
    })
  })

  describe('isValidFrom', function () {
    it('is optional', function () {
      expect(isValidFrom('')).to.equal(true)
    })

    it('accepts 16 digits', function () {
      expect(isValidFrom('1234567890123456')).to.equal(true)
    })

    it('rejects 17 digits', function () {
      expect(isValidFrom('12345678901234567')).to.equal(false)
    })

    it('rejects name with spaces', function () {
      expect(isValidFrom('Sender Name')).to.equal(false)
    })

    it('accepts 11 characters', function () {
      expect(isValidFrom('Abcdefghijk')).to.equal(true)
    })

    it('rejects 12 characters', function () {
      expect(isValidFrom('Abcdefghijkl')).to.equal(false)
    })
  })

  describe('isValidRouteConstraint', function () {
    it('rejects if from is set but route is not set', function () {
      expect(isValidRouteConstraint({ from: 'Unicorn' })).to.equal(false)
    })

    it('accepts if from is not set', function () {
      expect(isValidRouteConstraint({})).to.equal(true)
    })

    it('rejects if route is 1', function () {
      expect(isValidRouteConstraint({ from: 'Unicorn', route: 1 })).to.equal(false)
    })

    it('accepts if route is 3 or 5', function () {
      expect(isValidRouteConstraint({ from: 'Unicorn', route: 3 })).to.equal(true)
      expect(isValidRouteConstraint({ from: 'Unicorn', route: 5 })).to.equal(true)
    })
  })

  describe('validateFields', function () {
    it('rejects blank username or password', function () {
      expect(() => validateFields({})).to.throw('user')
      expect(() => validateFields({})).to.throw('password')
    })

    it('rejects blank "to"', function () {
      const valid = { user: 'a', pass: 'b' }
      expect(() => validateFields({ ...valid, to: '' })).to.throw('number')
    })

    it('accepts valid "to"', function () {
      const valid = { user: 'a', pass: 'b' }
      expect(() => validateFields({ ...valid, to: '00436761234567' })).not.to.throw('number')
    })
  })
})
