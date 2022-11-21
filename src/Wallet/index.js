import ec from 'elliptic';

class Wallet {
    constructor() {
        this.curveType = ec?.curves?.secp256k1;
        this.keyType = 'hex';
        this.ec = ec.ec(this.curveType);
        this.privateKey = this.createPrivateKey();
        this.publicKey = this.createPublicKey();
    }

    createPrivateKey = () => {
        const keyPair = this.ec?.genKeyPair();
        const privateKey = keyPair?.getPrivate(this.keyType);
        return privateKey;
    };

    createPublicKey = () => {
        if (!this.privateKey) {
            throw new Error('A wallet with that private key does not exist');
        }

        const key = this.ec?.keyFromPrivate(this.privateKey, this.keyType);
        const publicKey = key.getPublic(this.keyType);
        return publicKey;
    };
}

export default Wallet;
