import hashlib
import base64
import math
import binascii
import os
import random


def getBabyData(tokenid):

    os.chdir('/root/btc-icp')

    file_object = open('taprootaddress.txt', 'a')

    stream = os.popen("bitcoin-cli -named getnewaddress label=generic-p2tr address_type=bech32m" )
    btcAddress = stream.read()
    print(btcAddress)

    btcAddress = btcAddress.strip()
    
    print("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai setAddress '("+btcAddress+")'" )
    stream = os.popen("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai setAddress '(\""+btcAddress+"\")'" )
    result = stream.read()
    print(str(tokenid) + " Result : " + result)  
    
    file_object.write(btcAddress+"\n")

    file_object.close()
 

for token in range(0,5):

    getBabyData(token)


