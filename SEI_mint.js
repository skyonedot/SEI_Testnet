const pkg = require("@cosmjs/launchpad");
const fs = require('fs');
// const {SigningStargateClient, QueryClient, setupBankExtension, StargateClient} = require('@cosmjs/stargate')
const { SigningStargateClient, StargateClient } = require('@cosmjs/stargate');
const {SigningCosmWasmClient} = require("@cosmjs/cosmwasm-stargate");
// console.log(SigningCosmWasmClient)
const { get } = require("http");
const rpcEndpoint = "https://sei-testnet-2-rpc.brocha.in"

const { MsgExecuteContract, MsgSend } = require("cosmjs-types/cosmwasm/wasm/v1/tx.js");
// console.log(MsgExecuteContract)
// import {toUtf8} from "@cosmjs/encoding";
const { toUtf8 } = require("@cosmjs/encoding");

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
        return 0
    }
}

async function mintNFT(from_mnemonic){
    const from_wallet = await pkg.Secp256k1HdWallet.fromMnemonic(
        from_mnemonic,
        {
            prefix: 'sei'
        }
    );
    let from = (await from_wallet.getAccounts())[0].address;
    let balance = await getSeiBalance(from)

    let gasValue = 5000
    let gasUsed = '500000'
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
    console.log(`${from} start mint NFT`)
    // const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, from_wallet);
    const client = await SigningCosmWasmClient.connectWithSigner(rpcEndpoint, from_wallet);
    let ops = [];

    let msg1 = {
        extension: {
            msg: {
                register: {
                    "signature": "",
                }
            }
        }
    }
    
    let msg2 = {
        extension: {
            msg: {
                redeem: {
                    "amount": 1,
                }
            }
        }

    }
    
    const executeContractMsg1 = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
            sender: from,
            contract: "sei180um8ntda6rfm89x0yq5hlzqdsq3jvhmjch7e5yydf4ykmuafdfslvmlsu",
            msg: (0, toUtf8)(JSON.stringify(msg1)),
            // msg: msg1,
            funds: [],
        }),
    };

    const executeContractMsg2 = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
            sender: from,
            contract: "sei180um8ntda6rfm89x0yq5hlzqdsq3jvhmjch7e5yydf4ykmuafdfslvmlsu",
            msg: (0, toUtf8)(JSON.stringify(msg2)),
            // msg: msg2,
            funds: [],
        }),
    };
    ops.push(executeContractMsg1);
    ops.push(executeContractMsg2);
    try {
        let result = await client.signAndBroadcast(from, ops, fee, '');
        console.log("From:", from ,"Hash:" ,result.transactionHash)
    } catch (e) {
        console.log("From:", from, 'Error:', e.message)
    }
    console.log('------------------------')
}

async function main(){
    let data = (fs.readFileSync('wallet_real.txt', 'utf8')).split('\n');
    for(let i = 0; i < data.length; i++){
        await mintNFT(data[i].split('--')[1])
    }
}

main()