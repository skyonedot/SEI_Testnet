import requests
import time
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from dotenv import dotenv_values
config = dotenv_values(".env")  # config = {"USER": "foo", "EMAIL": "foo@example.org"}
# print(config["TOKEN"])
TOKEN = config["TOKEN"]  # 请替换成自己的TOKEN
REFERER = 'https://app.seinetwork.io'
BASE_URL = 'http://api.yescaptcha.com'
SITE_KEY = '73ec4927-b43f-40b1-b61a-646a5ec58a45' # 请替换成自己的SITE_KEY
TYPE = "HCaptchaTaskProxyless"


def create_task():
    url = F"{BASE_URL}/createTask"
    data = {
        "clientKey": TOKEN,
        "task": {
            "websiteURL": REFERER,
            "websiteKey": SITE_KEY,
            "type": TYPE
        }
    }
    try:
        response = requests.post(url, json=data, verify=False)
        if response.status_code == 200:
            data = response.json()
            print('response data:', data)
            return data.get('taskId')
    except requests.RequestException as e:
            print('create task failed', e)
            
def polling_task(task_id):
    url = f"https://api.yescaptcha.com/getTaskResult"
    send_data = {
        "clientKey": TOKEN,
        "taskId": task_id
    }
    
    count = 0
    while count < 120:
        try:
            response = requests.post(url, json=send_data, verify=False)
            if response.status_code == 200:
                data = response.json()
                status = data.get('status')
                # print('status of task', status, count)
                # print('********************************')
                if status == 'ready':
                    return data.get('solution', {}).get('gRecaptchaResponse')
        except requests.RequestException as e:
            print('polling task failed', e)
        finally:
            count += 1
            time.sleep(1)
    return None
            
def verify(response):
    url = "https://www.google.com/recaptcha/api2/demo"
    data = {"g-recaptcha-response": response}
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.text
    
def request_faucet(response,address,proxy_str):
    url = "https://faucet-v2.seinetwork.io/atlantic-2"
    ip_port = proxy_str.split(':')[:2]
    auth_info = tuple(proxy_str.split(':')[2:])
    proxies = {
        # 'https': 'https://{}:{}'.format(*ip_port)
        'http': 'http://{}:{}'.format(*ip_port)
    }
    if auth_info:
        proxies['http'] = 'http://{}:{}@{}:{}'.format(*auth_info, *ip_port)
        # proxies['https'] = 'https://{}:{}@{}:{}'.format(*auth_info, *ip_port)
    
    body = {
        "address": address,
        "captchaKey": response
    }
    headers = {
        'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
        'sec-ch-ua-platform': '"macOS"',
        'DNT': '1',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': '*/*'
    }
    res = requests.post(url, json=body, headers=headers, proxies=proxies, verify=False)
    if res.status_code == 200:
        return res.text
    else:
        print('request faucet failed', res.text)
        return None

    
def read_data(path):
    with open(path, 'r') as f:
        data = f.readlines()
        data = [i.split('--')[0].replace('\n','') for i in data]
        # data = [i.split('--')[0] for i in data]
        # data = [i.replace('\n','') for i in data]
        return data
    
def read_proxy(path):
    with open(path, 'r') as f:
        data = f.readlines()
        data = [i.replace('\n','') for i in data]
        return data
    
if __name__ == '__main__':
    # read txt file
    data = read_data('./wallet_real.txt')
    data = data[10:]
    # print(data)
    
    proxy = read_proxy('./wallet_proxy.txt')
    proxy = proxy[10:207]
    result_dict = {}
    count = 0
    # print(proxy)

    for i, b in enumerate(proxy):
        start = i * 2
        end = start + 2
        result_dict[b] = data[start:end]
    
    # print(result_dict)
    for key, value in result_dict.items():
        print(f"{key}:{value}")
        for address in value:
            task_id = create_task()
            print('create task successfully', task_id)
            response = polling_task(task_id)
            if response is None:
                print('polling task failed')
                continue
            print('get response:', response[0:40]+'...')
            print('address is :',address)
            result = request_faucet(response, address, key)
            print(result, 'Sleeping,,,', count)
            count += 1
            print('----------------------------')
            time.sleep(60) # 60秒等于1分钟
    
    # # for loop in data
    # # for address in data[25:27]:
    # #     task_id = create_task()
    # #     print('create task successfully', task_id)
    # #     response = polling_task(task_id)
    # #     print('get response:', response[0:40]+'...')
    # #     print('--------------------------',address)
    # #     result = request_faucet(response, address)
    # #     print(result, 'Sleeping,,,')
    # #     time.sleep(300) # 60秒等于1分钟
    # # print(proxy)