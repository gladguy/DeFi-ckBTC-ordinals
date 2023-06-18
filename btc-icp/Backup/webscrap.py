import requests
from lxml import etree
from bs4 import BeautifulSoup

URL = "https://ordinals.com/inscription/5619de1889432fbe731afa23108897bb718b62c6012c2c567572481c4bf1f9e3i0"
page = requests.get(URL)



with requests.get(URL) as fp:
    soup = BeautifulSoup(fp, "html.parser")
    print(soup.head.title)

print(page.text)
address = page.text.find("bc1", 0, len(page.text))

addressEnd = page.text.find("</dd>", address, len(page.text))

#print(page.text.find("bc1", 0, len(page.text)))

#print(page.text.find("</dd>", address, len(page.text)))



print(page.text[address:addressEnd])



