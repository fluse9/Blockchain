import ec from 'elliptic';

class Key {
    constructor() {
        this.curveType = ec?.curves?.secp256k1;
        this.keyType = 'hex';
        this.ec = ec.ec(this.curveType);
        this.key = this.ec?.genKeyPair();
        this.publicKey = this.key?.getPublic(this.keyType);
        this.privateKey = this.key?.getPrivate(this.keyType);
    }
}

export default Key;
