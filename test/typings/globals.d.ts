declare const expect: any

declare namespace NodeJS {
  interface Global {
    chai: any
    expect: any
  }
}
