import axios from 'axios'

const client = axios.create();

export abstract class BaseService {
    public readonly _basePath: string;

    constructor (path: string) {
        this._basePath = path
    }

    post (data: any): Promise<any> {
        return client.post(this._basePath, data)
    }

    put (data: any, path?: any): Promise<any> {
        return client.put(this._basePath + path, data)
    }

    get (id: string): Promise<any> {
        return client.get(`${this._basePath}/${id}`)
    }

    getAll (): Promise<any[]> {
        return client.get(this._basePath)
    }
}
