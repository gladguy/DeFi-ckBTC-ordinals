from bs4 import BeautifulSoup
import json
import requests
from lxml import etree
import hashlib
import base64
import math
import binascii
import os
import random





file1 = open('taprootaddress.txt', 'r')
Lines = file1.readlines()


for line in Lines:
    btcAddress = line.strip()

    print("BTC Address " + btcAddress)                     
    print("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai clearInscriptions '(\""+btcAddress+"\")'")
    stream = os.popen("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai clearInscriptions '(\""+btcAddress+"\")'")

    result = stream.read()
    print(result)  


filename = 'Inscriptions.txt'
try :
    size = os.path.getsize(filename)
    if(size == 0):
    	filename = 'Inscriptions01.txt'
  
except OSError :
    print("Path '%s' does not exists or is inaccessible" %filename)
    filename = 'Inscriptions01.txt'

input_file = open (filename)
json_array = json.load(input_file)
store_list = []

for item in json_array:
     
    URL = "https://ordinals.com/inscription/" + item['inscription']
    
    page = requests.get(URL)
    
    address = page.text.find("bc1", 0, len(page.text))
    addressEnd = page.text.find("</dd>", address, len(page.text))
    diffence = addressEnd - address

    #print(diffence)
    parsedAddress = page.text[address:addressEnd]
    if(diffence == 621):
        print(parsedAddress)

    doc = BeautifulSoup(page.text, "html.parser")
    
    heading = doc.find("h1")

    #for element in doc.find_all("dd"):
    #	if(element.text.find()
    
    for ele in doc.find_all(class_ = "monospace"):
        if(ele.text.find("bc1", 0,len(ele.text)) == 0): 
            #print("\n\nHash : " + item['inscription'] + "\n" + heading.text + "\nHolder " +  ele.text)
            
            holder = ele.text
            hashText=item['inscription']
            inscription=heading.text
            
            
            # Using readlines()
            file1 = open('taprootaddress.txt', 'r')
            Lines = file1.readlines()
 
            count = 0
            # Strips the newline character
            for line in Lines:
                 count += 1
                 btcAddress = line.strip()

                 if(btcAddress == holder):
                      print("Some one sent an Ordinals...." + btcAddress)                     
                      print("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai setInscriptions '(\""+holder+"\",\""+hashText+"\",\""+inscription+"\")'")
                      stream = os.popen("dfx canister --network ic call cepwu-pyaaa-aaaal-acpiq-cai setInscriptions '(\""+holder+"\",\""+hashText+"\",\""+inscription+"\")'")

                      result = stream.read()
                      print(result)  




