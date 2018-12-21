/// <reference path='typings/globals.d.ts' />

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)

global.chai = chai
global.expect = chai.expect

console.log('**************')
console.log('* SETUP DONE *')
console.log('**************')
