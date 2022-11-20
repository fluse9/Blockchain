import Blockchain from './Blockchain/index.js';

const testBlockchain = new Blockchain();
testBlockchain.createNewBlock(new Date().toISOString(), 'test');
console.log(testBlockchain);
