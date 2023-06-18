#!/bin/bash

export DFX_WARNING=-version_check

dfx identity --network ic use marspool

dfx canister --network ic id  BitcoinBunny

dfx wallet --network ic balance

eval dfx canister  --network ic create  BitcoinBunny --with-cycles 2000000000000

dfx build --network ic BitcoinBunny

dfx deploy --network ic  BitcoinBunny

dfx identity --network ic use marspool

#dfx canister   --network ic stop BitcoinBunny
#dfx canister   --network ic start BitcoinBunny
# /BitcoinBunny/assets