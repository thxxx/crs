# Flask 서버
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import torch
from rank_bm25 import BM25Okapi
import time
from utils import ask_question, make_recommendation
from recommend import return_top_3_and_score
import math

# # simCSE
# tokenizer = AutoTokenizer.from_pretrained("princeton-nlp/unsup-simcse-roberta-base")
# q_model = AutoModel.from_pretrained("princeton-nlp/unsup-simcse-roberta-base").to("cpu")
# # c_model = AutoModel.from_pretrained("princeton-nlp/unsup-simcse-roberta-base").to(device)

# q_model.load_state_dict(torch.load('q_encoder.pt'))
# c_model.load_state_dict(torch.load(GOOGLE_DRIVE_PATH + 'c_encoder.pt'))

# shared = q_model.encoder
# q_model.encoder = shared
# c_model.encoder = shared

app = Flask(__name__)
CORS(app)  # 모든 경로에 대해 CORS 정책 허용

context=""
threshold=170
user_liked_result = []
session_infos={
    "per_question":[], # question, answer - score.
    "users":[],
    "bots":[],
    "recommended_movies":[],
    "context":"",
}
stored_data=[]

@app.route('/api', methods=['POST'])
def index():
    req_data = request.get_json()  # POST 요청의 JSON 데이터 추출

    print("req_data", req_data)

    if not req_data or not isinstance(req_data, list):
        if session_infos['bots'][math.floor(req_data['index']/2)]['type'] == "ASK":
            print("asking good")
        else:
            stored_data.append({
                "context":session_infos["context"],
                "recommended_movies":session_infos["recommended_movies"]
            })
        print("req_data : ", stored_data)
        return jsonify({'error': 'Invalid request format'})

    response_data = req_data[:]  # 요청 데이터를 복사하여 response_data 초기화
    query = req_data[-1]['desc']
    print("\n\n", session_infos['context'], "\n\n")

    if query == "reset":
        session_infos['per_question']=[]
        session_infos['users']=[]
        session_infos['bots']=[]
        session_infos['recommended_movies']=[]
        session_infos['context']=""
        
        response_data.append({
            'type': 'recommender',
            'desc': "ok, conversation is reseted."
        })
        return jsonify([response_data, []])

    ask_start=time.time()
    duration = time.time() - ask_start    

    session_infos['context'] += "\nseeker:"+query
    # rec_movies = return_top_3_and_score(session_infos['context'])
    rec_movies = [
        {
            "score":150,
            'title':'avatar'+query
        },
        {
            "score":130,
            'title':'bat man'
        },
    ]

    print("현재까지 세션 인포 ", session_infos)
    if len(session_infos['users'])>0 and len(session_infos['bots'])>0:
        body={
            "question":session_infos['bots'][-1],
            "answer":session_infos['users'][-1],
            "added_score":rec_movies[0]['score'] - session_infos['recommended_movies'][-1][0]['score']
        }
        session_infos['per_question'].append(body)
    session_infos['users'].append({
        "text":query,
        "durations":duration,
    })
    session_infos['recommended_movies'].append(rec_movies)

    # 
    response_body={
        "text":"test",
        "type":"ASK",
        "feedback":"",
    }
    if len(session_infos['recommended_movies'])>3 or rec_movies[0]['score'] >= threshold:
        # 이제는 추천하기
        # 추천 하기로 결정
        print("추천할 영화 : ", [r['title'] for r in rec_movies])
        # response = make_recommendation(session_infos['context'], ["Avatar"])
        # response = make_recommendation(session_infos['context'], [rec_movies[0]['title']])
        response_body['type']="REC"
    elif rec_movies[0]['score'] < threshold:
        # 질문 하기로 결정
        # response = ask_question(session_infos['context'])
        response_body['type']="ASK"
    
    response = "Recommender : Ok let me know"
    print("\n받은 응답 : ", response, "\n")

    response_body['text']=response
    session_infos['context'] += "\n"+response # response is start with "recommender:"
    session_infos['bots'].append(response_body)

    # 새로운 객체 생성 및 배열 맨 끝에 추가
    response_data.append({
        'type': 'recommender',
        'desc': response
    })

    return jsonify([response_data, rec_movies])


# import tensorflow as tf
# from tensorflow.keras.models import Sequential
# from tensorflow.keras.layers import LSTM, Dense

# # 데이터 준비
# names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve']
# greetings = ['Hello', 'Hi', 'Hey', 'Greetings', 'Welcome']

# # 데이터 전처리
# name_to_greeting = dict(zip(names, greetings))

# # 모델 구성
# model = Sequential()
# model.add(LSTM(64, input_shape=(5, 1)))  # 입력 크기는 (시퀀스 길이, 1)
# model.add(Dense(len(greetings), activation='softmax'))
# model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# # 모델 학습
# X = []
# y = []
# for name, greeting in name_to_greeting.items():
#     X.append([ord(c) for c in name])  # 각 이름의 문자를 아스키 코드로 변환하여 입력 데이터에 추가
#     y.append(greetings.index(greeting))  # 해당 인사말의 인덱스를 타깃 데이터에 추가

# X = tf.keras.preprocessing.sequence.pad_sequences(X, padding='post', maxlen=5)  # 시퀀스 길이를 5로 맞추고 패딩
# X = tf.expand_dims(X, axis=-1)  # 차원 확장
# y = tf.keras.utils.to_categorical(y, num_classes=len(greetings))  # 원-핫 인코딩

# model.fit(X, y, epochs=10)

# @app.route('/', methods=['GET'])
# def index():
#     name = request.args.get('name', '')

#     if not name:
#         return jsonify({'error': 'Name is missing'})

    # 입력 데이터 전처리
    # x = [ord(c) for c in name]
    # x = tf.keras.preprocessing.sequence.pad_sequences([x], padding='post', maxlen=5)
    # x = tf.expand_dims(x, axis=-1)  # 차원 확장

    # # 모델 예측
    # prediction = model.predict(x)
    # predicted_greeting = greetings[prediction.argmax()]

    # response = {'greeting': predicted_greeting}

    # return jsonify(response)

if __name__ == '__main__':
    app.run(port=5001)
    context=""
    threshold=170
    user_liked_result = []
    session_infos={
        "per_question":[], # question, answer - score.
        "users":[],
        "bots":[],
        "recommended_movies":[],
        "context":"",
    }

    