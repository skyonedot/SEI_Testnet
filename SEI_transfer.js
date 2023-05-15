const pkg = require("@cosmjs/launchpad");
const fs = require('fs');
// const {SigningStargateClient, QueryClient, setupBankExtension, StargateClient} = require('@cosmjs/stargate')
const { SigningStargateClient, StargateClient } = require('@cosmjs/stargate');
const { get } = require("http");
const rpcEndpoint = "https://sei-testnet-2-rpc.brocha.in"
// const rpcEndpoint = "https://rpc.atlantic-2.seinetwork.io/"
// let from_wallet_address = (fs.readFileSync('hjq_abandon.txt', 'utf8')).split('\n');
// let to_wallet_address = (fs.readFileSync('hjq_remain.txt', 'utf8')).split('\n');
// let all_wallet = (fs.readFileSync('balance.txt', 'utf8')).split('\n');

async function getSeiBalance(address) {
    try{
        const client = await StargateClient.connect(rpcEndpoint)
        let balance = await client.getAllBalances(address)
        if(balance.length == 0){
            console.log(address, '--', balance, "No Faucet");
            return 0
        }
   
        flag = false
        for (let i = 0; i < balance.length; i++) {
            if (balance[i].denom == 'usei') {
                balance = balance[i].amount
                flag = true
                break
            }
        }
        if(!flag){
            console.log(address, '--', balance, "No Faucet");
            return 0
        }else{
            // console.log((balance))
            return parseInt(balance)
        }

    }catch(e){
        console.log("get balance Error", address)
        // console.log(e.message)
        return 0
    }
}




async function transfer(from_mnemonic, to_mnemonic) {
    const from_wallet = await pkg.Secp256k1HdWallet.fromMnemonic(
        from_mnemonic,
        {
            prefix: 'sei'
        }
    );
    const to_wallet = await pkg.Secp256k1HdWallet.fromMnemonic(
        to_mnemonic,
        {
            prefix: 'sei'
        }
    );
    let from = (await from_wallet.getAccounts())[0].address;
    let to = (await to_wallet.getAccounts())[0].address;



    let gasValue = 1000
    let gasUsed = '95577'
    const fee = {
        //amount 指的是Fee, 即gasPrice * gas 的出来
        amount: pkg.coins(gasValue, "usei"),
        gas: gasUsed,
    };
    let value = (await getSeiBalance(from)) - gasValue - 1000
    if (value < 0) {
        console.log(`From Wallet send Value is ${value} Not enough balance`)
        return
    }
    console.log(`Start transferr from ${from} to ${to}, value is ${value} usei`)

    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, from_wallet);

    let ops = [];
    let msg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: from,
            toAddress: to,
            amount: pkg.coins(value, "usei")
        },
    };
    ops.push(msg);
    try {
        let result = await client.signAndBroadcast(from, ops, fee, '');
        console.log("Hash:", result.transactionHash)
    } catch (e) {
        console.log('Error:', e.message)
    }
    console.log('------------------------')
}


async function transfertoAddress(from_mnemonic, to_address) {
    const from_wallet = await pkg.Secp256k1HdWallet.fromMnemonic(
        from_mnemonic,
        {
            prefix: 'sei'
        }
    );
    // const to_wallet = await pkg.Secp256k1HdWallet.fromMnemonic(
    //     to_mnemonic,
    //     {
    //         prefix: 'sei'
    //     }
    // );
    let from = (await from_wallet.getAccounts())[0].address;
    let to = to_address;



    let gasValue = 1000
    let gasUsed = '95577'
    const fee = {
        //amount 指的是Fee, 即gasPrice * gas 的出来
        amount: pkg.coins(gasValue, "usei"),
        gas: gasUsed,
    };
    let value = (await getSeiBalance(from)) - gasValue - 1000
    if (value < 0) {
        console.log(`From Wallet ${from} send Value is ${value} Not enough balance`)
        return 
    }
    console.log(`Start transferr from ${from} to ${to}, value is ${value} usei`)

    const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, from_wallet);

    let ops = [];
    let msg = {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress: from,
            toAddress: to,
            amount: pkg.coins(value, "usei")
        },
    };
    ops.push(msg);
    try {
        let result = await client.signAndBroadcast(from, ops, fee, '');
        console.log("Hash:", result.transactionHash)
    } catch (e) {
        console.log('Error:', e.message)
    }
    console.log('------------------------')
}

function searchAddressGetMnemonic(address) {
    for (let i = 0; i < all_wallet.length; i++) {
        if ((all_wallet[i].split('--')[0]).toLowerCase() == address.toLowerCase() ) {
            return all_wallet[i].split('--')[1]
        }
    }
    return false
}

// console.log(searchAddressGetMnemonic('sei1rz53z8t3sqana4kqrhpfdu9698nta7auzsx7nr'))


async function main(){
    for(let i=0;i<from_wallet_address.length;i++){
        let from_balance = await getSeiBalance(from_wallet_address[i])
        let to_balance = await getSeiBalance(to_wallet_address[i])
        if(from_balance > 1e5 || to_balance < 1e5){
            console.log("Error",i, from_wallet_address[i], from_balance, to_wallet_address[i], to_balance)
        }else{
            console.log("Success",i, from_wallet_address[i], from_balance, to_wallet_address[i], to_balance)
        }
        // console.log(i, from_wallet_address[i], from_balance, to_wallet_address[i], to_balance)
        // let from_mnemonic = searchAddressGetMnemonic(from_wallet_address[i])
        // let to_mnemonic = searchAddressGetMnemonic(to_wallet_address[i])
        // if(from_mnemonic && to_mnemonic){
        //     try{
        //         await transfer(from_mnemonic, to_mnemonic)
        //     }catch(e){
        //         console.log(i," -- Start Error:", e.message)
        //     }
        // }else{
        //     console.log(`${i}, Can't find mnemonic of ${from_wallet_address[i]} or ${to_wallet_address[i]}`)
        // }
    }
}

// main()
// async function combineData(){
//     for(let i=0;i<from_wallet_address.length;i++){
//         all_wallet.forEach((item) => {
//             if(item.split(',')[0] == from_wallet_address[i]){

//             }
//         })
//         from_wallet_address[i]
        
//     }
// }

async function test(){
    let big_wallet_addresses = (fs.readFileSync('balance.txt', 'utf8')).split('\n');
    let small_wallet_addresses = (fs.readFileSync('balance2to1.txt', 'utf8')).split('\n');
    let to_list = []
    small_wallet_addresses.forEach((item) => {
        to_list.push(item.replace('\n',''))
    })
    for(let i=0;i<big_wallet_addresses.length;i++){
    // for(let i=0;i<10;i++){
        let item = big_wallet_addresses[i]
        let from_address = item.split('--')[0]
        let mnemonic = item.split('--')[1]
        // if(to_list.indexOf(from_address) != -1 ){
        //     console.log(item)
        // }
        // let balance = await getSeiBalance(from_address)
        // console.log(from_address,balance)
        if(to_list.indexOf(from_address) == -1 ){
            // console.log(item)
            await transfertoAddress(mnemonic, to_list[(i%to_list.length)])
        }
    }

    // big_wallet_addresses.forEach((item, index) => {

    // })
    // // console.log(to_list.length)
    // // console.log(big_wallet_addresses.length, small_wallet_addresses.length)
    // // console.log(small_wallet_addresses)
    // console.log(await getSeiBalance('sei1f9wca53uu9kq3n5vljk9qpmt0dht2atflu6f8m'))
}

test()