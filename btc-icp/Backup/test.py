#from bs
from bs4 import BeautifulSoup

#import requests library
import requests
#the website URL
url_link = "https://ordinals.com/inscription/5619de1889432fbe731afa23108897bb718b62c6012c2c567572481c4bf1f9e3i0"
result = requests.get(url_link).text
doc = BeautifulSoup(result, "html.parser")

heading = doc.find("h1")
print(heading.text)


#print(doc.prettify())
