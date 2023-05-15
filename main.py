import requests
import time

TOKEN = ''  # 请替换成自己的TOKEN
REFERER = 'https://app.seinetwork.io'
BASE_URL = 'http://api.yescaptcha.com'
SITE_KEY = '73ec4927-b43f-40b1-b61a-646a5ec58a45' # 请替换成自己的SITE_KEY
TYPE = "NoCaptchaTaskProxyless"



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
            print('uu',url, send_data)
            response = requests.post(url, json=send_data, verify=False)
            if response.status_code == 200:
                data = response.json()
                print('data',data)
                status = data.get('status')
                print('status of task', status, count)
                print('---------------------------------')
                if status == 'ready':
                    return data.get('solution', {}).get('gRecaptchaResponse')
        except requests.RequestException as e:
            print('polling task failed', e)
        finally:
            count += 1
            time.sleep(1)
            
def verify(response):
    url = "https://www.google.com/recaptcha/api2/demo"
    data = {"g-recaptcha-response": response}
    response = requests.post(url, data=data)
    if response.status_code == 200:
        return response.text
    
def request_faucet(response):
    url = "https://faucet-v2.seinetwork.io/atlantic-2"
    body = {
        "address": "sei194dle5wsksqza9r0f55ktcmzmt40r0u5jdnzuy",
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
    res = requests.post(url, json=body, headers=headers)
    if res.status_code == 200:
        print("Success")
        return res.text
    else:
        print('request faucet failed', res.text)
        return None

    
    
if __name__ == '__main__':
    task_id = create_task()
    print('create task successfully', task_id)
    # task_id = 'd6004e88-d29f-11ed-aa38-4a7b0c2cfc4d'
    response = polling_task(task_id)
    print('get response:', response[0:40]+'...')
    print('--------------------------')
    # result = verify(response)
    # print(result)
    result = request_faucet(response)
    print(result)