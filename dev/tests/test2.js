const Blockchain = require('../blockchain');
const bc = new Blockchain();

bc.createNewBlock(789457,'OIUOEDJETH8754DHKD','78SHNEG45DER56');
bc.createNewTransaction(100,'ALEXHT845SJ5TKCJ2','JENN5BG5DF6HT8NG9');
console.log(bc);
