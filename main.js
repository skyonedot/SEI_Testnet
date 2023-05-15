const { Secp256k1HdWallet } = require("@cosmjs/launchpad");
const { StargateClient } = require("@cosmjs/stargate")
const bip39 = require("bip39");
const fs = require('fs');
let data = fs.readFileSync('balance.txt', 'utf8');
data = data.split('\n');

const rpc = "https://sei-testnet-2-rpc.brocha.in"




// console.log(Secp256k1HdWallet);

async function generate(mnemonic) {
    const wallet = await Secp256k1HdWallet.fromMnemonic(
        mnemonic,
        {
            prefix: 'sei'
        }
    );
    let address = await wallet.getAccounts();
    fs.writeFileSync('complete_sei.txt', address[0].address + '--' + mnemonic + '\n', { flag: 'a+' })
    console.log(address[0].address);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWallet() {
    for (let i = 0; i < 10000; i++) {
        const mnemonic = bip39.generateMnemonic();
        await generate(mnemonic);
    }
}

// generateWallet()



// async function main() {
//     const client = await StargateClient.connect(rpc)
//     let balance_sum = 0
//     for(let i = 0; i < data.length-1; i++){
//         let address = data[i].split('--')[0]
//         let balance = await client.getAllBalances( address )
//         if(balance.length > 0){
//             balance = balance[0].amount
//             balance = parseInt(balance) / 1e9
//             if(balance > 0.1){
//                 console.log(address, '--' , balance);
//             }
//             balance_sum += balance
//             // console.log(address, '--' ,data[i].split('--')[0], balance);
//             // console.log(`${i} -- YES -- ${address} -- ${balance} -- ${balance_sum}`);
//             // fs.writeFileSync('balance.txt', data[i]+'\n', { flag: 'a+' })
//         }else{
//             console.log(`${i} -- Nope -- ${address} -- 0 -- ${balance_sum}`);
//         }
//         await sleep(100)
//     }
//     // console.log(StargateClient);

//     // console.log("With client, chain id:", await client.getChainId(), ", height:", await client.getHeight())


// }




// main()

async function checkAccountBalance(address) {
    try{
        const client = await StargateClient.connect(rpc)
        let balance = await client.getAllBalances(address)
        if(balance.length == 0){
            console.log(address, '--', balance, "No Faucet");
            return 0
        }
        // console.log(balance)
        for (let i = 0; i < balance.length; i++) {
            if (balance[i].denom == 'usei') {
                balance = parseInt(balance[i].amount)
                break
            }
        }
        if (balance >= 100000) {
            console.log(address, '--', balance, "balance is too big");
        }else if (balance == 0){
            console.log(address, '--', balance, "balance is zero");
        }else{
            console.log(address, '--', balance, "Has used, no get new faucet");
        }
        return balance / 1000000
    }catch(e){
        console.log("Request Error", address);
        return 0
    }

}


async function check() {
    console.log(await checkAccountBalance('sei10fn29cf834a4aj3urq7h6yrsv0wvdfxdvhecnd'))
    // let new_wallet = fs.readFileSync('./balance2to1.txt', 'utf8');
    // new_wallet = new_wallet.split('\n');
    // let sum = 0
    // for (let i = 0; i < new_wallet.length - 1; i++) {
    //     sum += await checkAccountBalance(new_wallet[i].split('--')[0])
    //     await sleep(1000)
    // }
    // console.log("Smallest balance:", sum);
}

check()

