#!/bin/bash
cd /home/waheed/bin

cp dfx14_1 dfx

cd /home/waheed/Bitcoin/examples/motoko/basic_bitcoin


dfx identity --network ic use marspool

#https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=cepwu-pyaaa-aaaal-acpiq-cai

export DFX_WARNING=-version_check

NETWORK="--network ic"
MODE="upgrade"  # Save Data

OWNER="principal \"$( \
    dfx identity get-principal
)\""



dfx canister --network ic id basic_bitcoin

dfx wallet --network ic balance

#eval dfx canister  --network ic create  basic_bitcoin --with-cycles 2000000000000

eval dfx build --network ic basic_bitcoin

OWNER="principal \"$( \
    dfx identity get-principal
)\""

eval dfx canister --network ic install basic_bitcoin --argument "'(variant { Mainnet }, $OWNER)'"  --mode $MODE



echo dfx canister --network ic call basic_bitcoin setAddress '("bc1pjj4uzw3svyhezxqq7cvqdxzf48kfhklxuahyx8v8u69uqfmt0udqlhwhwz")'

#https://ordinals.com/inscription/5619de1889432fbe731afa23108897bb718b62c6012c2c567572481c4bf1f9e3i0