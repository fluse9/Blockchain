import SHA256 from 'crypto-js/sha256.js';
import Wallet from '../Wallet/index.js';

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    createHash = () => {
        return SHA256(
            this.fromAddress + this.toAddress + this.amount
        ).toString();
    };

    signTransaction = (wallet, keyType) => {
        if (wallet?.getPublic(keyType) !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }

        const transactionHash = this.createHash();
        const signatureType = 'base64';
        const signature = wallet?.sign(transactionHash, signatureType);
        this.signature = signature.toDER(keyType);

        return this.signature;
    };

    validateTransaction = () => {
        if (this.fromAddress === null) {
            return true;
        } else if (!this.signature || this.signature?.length === 0) {
            throw new Error('No signature in this transaction');
        }

        const wallet = new Wallet();
        const publicKey = wallet?.ec?.keyFromPublic(
            this.fromAddress,
            wallet?.keyType
        );
        const isPublicKeySigned = publicKey?.verify(
            this.createHash(),
            this.signature
        );

        return isPublicKeySigned;
    };
}

export default Transaction;
