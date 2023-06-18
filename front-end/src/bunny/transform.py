fileName = "standing01"
file = open(fileName, "r")

count = 0
first = 0
second = 1
line_length =0
for line in file:
    count = count + 1
    char1 = line[first:second]
    print("Line = " + str(count))
    line_length = len(line)
    print("Length = " + str(line_length))
    print(char1)
    first = first+1
    second = second+1

print("Count " + str(count))
file.close()

first = 0
second = 1
line_count = count
count = 0

mainstr=""


for i in range(0,line_length):
    file = open(fileName, "r")
    line1=0
    substr=""
    for line in file:
        line1 = line1+1
        print(line)
        if(line_length >= second):
            character = line[first:second]
            print("Line =" + str(line1))
            print("Character at (%i,%i) = %c" % (first,second, character))
            substr = substr+character 
    file.close()
    first = first+1
    second = second+1
    print("Time looping file : " + str(i))
    print(substr)
    mainstr = mainstr.strip()+"."+substr.strip()
print(i)
 

mainstr = '"' + mainstr.strip() + '",'

mainstr = mainstr.replace("..", ".")

w = open(fileName+".txt", "w")
w.write(mainstr)
w.close()
