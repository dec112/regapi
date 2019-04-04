/* eslint-env mocha */
import { expect } from 'chai'
import Firmensms from './index'

describe('firmensms', function () {
  it('throws if passed no username or password', function () {
    expect(() => new Firmensms()).to.throw()
  })

  it('throws if passed empty username or password', function () {
    expect(() => new Firmensms('')).to.throw()
    expect(() => new Firmensms('', '')).to.throw()
    expect(() => new Firmensms('user', '')).to.throw()
    expect(() => new Firmensms('user')).to.throw()
  })

  it('return client object with send method', function () {
    const client = new Firmensms('a', 'b')
    expect(client).to.have.property('send')
    expect(client.send).to.be.a('function')
  })
})
