import json
import requests
from lxml import etree


input_file = open ('allInscriptionsMay27.txt')
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
    if(diffence == 62):
        #print(URL + " " + parsedAddress)
        print(parsedAddress)
    #print(page.text[address:addressEnd])
    
    #print(URL)
    	
