declare const sinon: any
declare const expect: any

declare namespace NodeJS {
  interface Global {
    chai: any
    sinon: any
    expect: any
  }
}
