import json

log_file_path = "D:/My Server Empire/1.20.2 Server/logs/latest.log"

last_line = ''
id = 0
print('< File Parser Started >')
def read_penultimate_line(file_path):
    with open(file_path, 'r') as file:
        content = file.readlines()
        if len(content) > 2:
            penultimate_line = content[-1].strip()
            return penultimate_line
    return None

while True:
    penultimate_line = read_penultimate_line(log_file_path)
    if penultimate_line is not None and penultimate_line != last_line:
        data = penultimate_line
        last_line = data

        first_name_border = data.find('<')
        last_name_border = data.find('>')

        if first_name_border != -1:
            messageDict = {
                'username': data[first_name_border + 1: last_name_border],
                'message': data[last_name_border + 2:],
                'type': 'message',
                'id': id
            }
            id += 1
            print(messageDict)
            json_data = json.dumps(messageDict)
            with open("C:/Users/KenBeChillin/OneDrive/Documents/Discord Bot/src/latest_message.json", "w") as json_file:
                json_file.write(json_data)
        elif data.find('the game') != -1:
            messageDict = {
                'username': data[33:].split()[0],
                'message': data[33:].split()[1],
                'type': 'join/leave',
                'id': id
            }
            id += 1
            print(messageDict)
            json_data = json.dumps(messageDict)
            with open("C:/Users/KenBeChillin/OneDrive/Documents/Discord Bot/src/latest_message.json", "w") as json_file:
                json_file.write(json_data)
