import { Wallet } from "@project-serum/anchor";
import { createCloseAccountInstruction } from "@solana/spl-token";
import { Keypair, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

let i = 0;
let genwallets = [];
const transactionIns = [];

while(i<5){
    const wallets = Keypair.generate();
    genwallets.push(wallets)
    i++;
    transactionIns.push(createCloseAccountInstruction(account, destination, authorityPublicKey, multiSigners, programId))


}

const {blockhash} = await connection.getLatestBlockhash()

const message = new TransactionMessage({
    payerKey: Wallet,
    recentBlockhash: blockhash,
    instructions: transactionIns,

}).compileToV0Message()

const transactionnn = new VersionedTransaction(message);








