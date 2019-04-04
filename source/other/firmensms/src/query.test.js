/* eslint-env mocha */
import { expect } from 'chai'
import {
  translateRegularOptions,
  translateSpecialOptions,
  translateBooleanOptions,
  buildQuery,
  optionToParam
} from './query'

describe('query', function () {
  describe('optionToParam', function () {
    it('translates options', function () {
      expect(optionToParam('from')).to.equal('absender')
    })

    it('keeps raw options', function () {
      expect(optionToParam('status')).to.equal('status')
    })
  })

  describe('translateRegularOptions', function () {
    it('build object with no keys', function () {
      expect(translateRegularOptions({})).to.eql({})
    })

    it('build object with one keys', function () {
      expect(translateRegularOptions({ status: '1' })).to.eql({ status: '1' })
    })

    it('build object with mixed keys', function () {
      expect(translateRegularOptions({
        from: '0043123456789',
        to: '0043123456789',
        text: 'Hey'
      })).to.eql({
        absender: '0043123456789',
        nummer: '0043123456789',
        text: 'Hey'
      })
    })
  })

  describe('translateSpecialOptions', function () {
    it('handles json option', function () {
      expect(translateSpecialOptions({ json: true })).to.eql({ response: 'json' })
    })

    it('handles flash option', function () {
      expect(translateSpecialOptions({ flash: true })).to.eql({ type: 'flash' })
    })
  })

  describe('translateBooleanOptions', function () {
    it('handles test option', function () {
      expect(translateBooleanOptions({ test: true })).to.eql({ test: '1' })
    })

    it('handles statusReport option', function () {
      expect(translateBooleanOptions({ statusReport: true })).to.eql({ statusReport: '1' })
    })
  })

  describe('buildQuery', function () {
    it('build string from object', function () {
      expect(buildQuery({
        from: '0043123456789',
        to: '0043123456789',
        text: 'Hey'
      })).to.eql('absender=0043123456789&nummer=0043123456789&text=Hey')
    })

    it('urlencodes text', function () {
      expect(buildQuery({
        from: 'ABC',
        text: 'Hello, you. This! is? a Test & äüö :'
      })).to.eql('absender=ABC&text=Hello%2C%20you.%20This!%20is%3F%20a%20Test%20%26%20%C3%A4%C3%BC%C3%B6%20%3A')
    })

    it('urlencodes line break', function () {
      expect(buildQuery({
        text: 'Line1\nLine2'
      })).to.eql('text=Line1%0ALine2')
    })
  })
})
