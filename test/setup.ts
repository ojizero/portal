/// <reference path='typings/globals.d.ts' />

import chai from 'chai'
import sinon from 'sinon'

import sinonChai from 'sinon-chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(sinonChai)
chai.use(chaiAsPromised)

global.chai = chai
global.sinon = sinon

global.expect = chai.expect
