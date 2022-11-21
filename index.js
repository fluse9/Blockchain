import Blockchain from './src/Blockchain/index.js';
import Wallet from './src/Wallet/index.js';
import Transaction from './src/Transaction/index.js';

const publicKey =
    '04f947e4518d6cb2cf36d50d031493080be3638a62b204cab7051f27df8ddc1a7416c8aed95c3cc75c37009b22fb5a899abd3b6961caf7277c46d442edf5e04e35';
const privateKey =
    '2884c3b7c21d71f7fbee7dd10ff7c03040f35908aa6f13d142f6186816139145';

const wallet = new Wallet();
console.log(wallet);
const myWallet = wallet?.ec?.keyFromPrivate(privateKey);
console.log(myWallet);
const myWalletAddress = myWallet?.getPublic(wallet?.keyType);
console.log(myWalletAddress);

const testBlockchain = new Blockchain();
testBlockchain.createValidator(myWalletAddress);

const transaction1 = new Transaction(myWalletAddress, 'wallet2', 10);
transaction1.signTransaction(myWallet, wallet?.keyType);
console.log(transaction1);

testBlockchain.createPendingTransaction(transaction1);

const validatorOfLastBlockWalletAddress =
    testBlockchain.updateValidatorOfLastBlock();
testBlockchain.createBlock(validatorOfLastBlockWalletAddress);
testBlockchain.createBlock(validatorOfLastBlockWalletAddress);
console.log(testBlockchain);
console.log(testBlockchain.readAddressBalance(myWalletAddress));

testBlockchain.chain[1].transactions[0].amount = 1;

console.log(testBlockchain.validateChain());
