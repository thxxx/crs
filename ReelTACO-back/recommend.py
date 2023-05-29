import numpy as np
import torch
import json
from rank_bm25 import BM25Okapi
import faiss

device = "cpu"

def return_top_3_and_score(context, k=10):
    movie_infos=[]
    with open("./movie_infos.json", "r") as jso:
        movie_infos = json.load(jso)
        print("길이 ", len(movie_infos))

    corpus = [ x['text'] for x in movie_infos ]
    tokenized_corpus = [doc.split(" ") for doc in corpus]
    bm25 = BM25Okapi(tokenized_corpus)

    sentence_embeddings = torch.load("./embeds.pt")
    d = sentence_embeddings.shape[2]  # number of dimensions
    index = faiss.IndexFlatIP(d)  # create a cosine similarity index
    for i in range(len(sentence_embeddings)):
        index.add(sentence_embeddings[i])  # add the sentence embedding to the index

    if len(context)>1700:
        return []

    tokenized_query = context.split(" ")
    doc_scores = bm25.get_scores(tokenized_query)
    mean = np.mean(doc_scores)
    std = np.std(doc_scores)
    
    tokenized = tokenizer(context, return_tensors='pt')
    input_ids, attention_mask = tokenized['input_ids'].to(device), tokenized['attention_mask'].to(device)
    with torch.no_grad():
        model_output = q_model(input_ids=input_ids, attention_mask=attention_mask)
    CLS_TOKEN = model_output.last_hidden_state[:, 0, :].cpu().detach().numpy()

    # k is number of nearest neighbors to search for
    D, I = index.search(CLS_TOKEN, k)  # search for the nearest neighbor

    movie_list = []
    for i in range(k):
        if doc_scores[I[0][i]] < 5:
            continue
        bm_score = (doc_scores[I[0][i]]-mean)*5/std
        print("bm_socre", D[0][i], bm_score, "\n")
        # title = movies[movies['rotten_tomatoes_link'] == most_relevant_movie_key]['movie_title'].values[0]
        movie_list.append({
            "movie" : movie_infos[I[0][i]],
            "title" : movie_infos[I[0][i]]['title'],
            "score" : D[0][i] + bm_score,
        })
    
    movie_list = sorted(movie_list, key=lambda d: d['score'], reverse=True)
    
    return movie_list