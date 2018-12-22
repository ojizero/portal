export interface Client {
  request (method: string, path: string, payload: {}, options: any): Promise<any> // TODO:
}

export class PortalClient implements Client {
  constructor () {
    // TODO:
  }

  request (method: string, path: string, payload: {}, options: any): Promise<any> {
    return Promise.resolve() // TODO:
  }
}

export default PortalClient
