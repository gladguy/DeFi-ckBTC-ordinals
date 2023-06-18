import json

input_file = open ('allInscriptionsMay27.txt')
json_array = json.load(input_file)
store_list = []

for item in json_array:
     
    print("https://ordinals.com/inscription/" + item['inscription'])
