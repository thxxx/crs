import time
import openai
API_KEY = "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"
openai.api_key = API_KEY

def make_recommendation(context, rec_movies):
  PROMPT=f"\
    Based on this conversation, Pick the best movie for the seeker from the <movies> below and make a sentence that recommends the chosen movie for the seeker. \
    Do not recommend movie in the conversation. <movies> are consist of title of the movie and information of the movie.\
    You should start with \"recommender:\"\
    conversation:{context}\
    movies:{rec_movies}\
  "
  past = time.time()
  response = openai.ChatCompletion.create(model="gpt-3.5-turbo", 
          messages=[
          {"role": "system", "content": "You are recommending good movies"},
          {"role": "user", "content": PROMPT},
          ]
          , temperature=0.5, max_tokens=500)
  taken_time = time.time() - past

  return response["choices"][0]["message"]["content"]

def ask_question(context):
  PROMPT=f"You are a recommender. make response of recommender to the seeker of below conversation. \
  you should respond to the seeker and ask a question to figure out what movies to recommend for better recommendation. Do not recommend a movie.\
  You should start with \"recommender:\".\n\n conversation:{context}"
  past = time.time()
  print("\n\n여기서 질문하는 것 까지 왔음\n\n")
  response = openai.ChatCompletion.create(model="gpt-3.5-turbo", 
          messages=[
            {"role": "system", "content": "You are recommending good movies"},
            {"role": "user", "content": PROMPT},
          ], temperature=0.5, max_tokens=500)
  taken_time = time.time() - past
  print("\ndhrllg 오기는 했다  ", response)

  return response["choices"][0]["message"]["content"]