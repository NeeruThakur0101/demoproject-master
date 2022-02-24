import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
@Injectable()
export class StorageService {
    constructor() { }
    public setStorage(data, key) {
            sessionStorage.setItem(key, CryptoJS.AES.encrypt(JSON.stringify(data), key).toString());
    }
    public getStorage(key) {
        if (sessionStorage.getItem(key)) {
        var decrypted =  CryptoJS.AES.decrypt(sessionStorage.getItem(key), key).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
        }
        else {
            return null;
        }
    }
    public removeStorage(key) {
        sessionStorage.removeItem(key);
    }
    public clearStorage() {
        sessionStorage.clear();
    }
}
