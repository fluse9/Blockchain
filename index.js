import Blockchain from './src/Blockchain/index.js';
import Transaction from './src/Transaction/index.js';

const testBlockchain = new Blockchain();
testBlockchain.createPendingTransaction(
    new Transaction('address1', 'address2', 100)
);
testBlockchain.createPendingTransaction(
    new Transaction('address2', 'address1', 50)
);
testBlockchain.writePendingTransactions('address3');
testBlockchain.writePendingTransactions('address3');
console.log(testBlockchain);
console.log(testBlockchain.getAddressBalance('address3'));
