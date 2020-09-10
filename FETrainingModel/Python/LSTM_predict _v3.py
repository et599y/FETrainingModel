#!/usr/bin/env python
# coding: utf-8

# In[1]:


import tensorflow as tf
import keras
import numpy as np
import pandas as pd
import sys
import json
from keras.models import load_model
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

def nor_load (df1):
    dd = pd.read_csv(minmaxpath,index_col=0)
    for i in range(df1.shape[1]-1):
        df1.iloc[:,1+i] = (df1.iloc[:,1+i]-dd.iloc[:,i]['min'])/(dd.iloc[:,i]['max']-dd .iloc[:,i]['min'])
    return df1

def buildTrain(train, pastDay, futureDay,col):
  tmpX, tmpY = [], []
  for i in range(0,train.shape[0]-futureDay-pastDay,futureDay):
    tmpX.append(np.array(train.iloc[i:i+pastDay]))
    tmpY.append(np.array(train.iloc[i+pastDay:i+pastDay+futureDay][col]))
  return np.array(tmpX), np.array(tmpY)

def denor(array,col):
    dd = pd.read_csv(minmaxpath,index_col=0)
    denormalized = array*(dd.T['max'][col]-dd.T['min'][col])+dd.T['min'][col]
    #print(col)
    return denormalized

def predict_multi_denor(array,col,type_):
    if len(col) != 1:
      if type_ == 'pre':
        tmp = [denor(model.predict(array, verbose=0)[:,:,i].reshape(1,-1)[0],col[i]) for i in range(len(col))]   
      elif type_ == 'y':
        tmp = [denor(array[:,:,i].reshape(1,-1)[0],col[i]) for i in range(len(col))]    
    elif len(col) == 1:
      if type_ == 'pre':    
        tmp = denor(model.predict(array, verbose=0).reshape(1,-1)[0],col[0])   
      elif type_ == 'y':     
        tmp = denor(array.reshape(1,-1)[0],col[0])
    return tmp 


# In[20]:



model_name = sys.argv[1]
csv_name = sys.argv[2]
col_name = sys.argv[3]
minmaxpath = sys.argv[4]
path = sys.argv[5]
pastDay = int(model_name.split('_')[-3])
futureDay = int(model_name.split('_')[-2])

# model_name = 'LSTM_0.7_0.2_7_3_20.h5'
# csv_name = 'MEFA00000003_predict_pre.csv'
# col_name = 'TOC_in_total,TOC_out'
# minmaxpath = 'min_max.csv'
# path = ''
# pastDay = int(model_name.split('_')[-3])
# futureDay = int(model_name.split('_')[-2])


#load & predict
model = load_model(model_name)
col = col_name.split(',')
X,y = buildTrain(pd.read_csv(csv_name,index_col=0).iloc[:,1:], pastDay, futureDay,col)
p = predict_multi_denor(X,col,'pre')

#json
ls,ls2 = [],[]
for i in range(len(col)):
    predict_value = {}
    predict_value['Column'] = col[i]
    predict_value['y'] = y[:,:,i].reshape(1,-1)[0].tolist()
    predict_value['predict'] = p[i].tolist()
    
    error_value={}    
    error_value['Column'] = col[i]
    error_value['predict_error'] = (np.asarray(predict_value['predict']) - np.asarray(predict_value['y'])).tolist()
    ls.append(predict_value)
    ls2.append(error_value)
with open(path+'predict_predict_value.json', 'w', encoding='utf8')  as json_file:
    json.dump(ls, json_file, ensure_ascii=False)
with open(path+'predict_error_value.json', 'w', encoding='utf8')  as json_file:
    json.dump(ls2, json_file, ensure_ascii=False)
    
#csv
tmp = pd.DataFrame()
for i in range(len(col)):
    tmp[col[i]] = p[i]
tmp.to_csv(path+'result.csv')


# In[21]:


# import matplotlib.pyplot as plt
# plt.figure(figsize=(20,5))
# if len(col) == 1:
#   plt.title(col[0])
#   plt.plot(ls[0]['y_train'],alpha=0.7)
#   plt.plot(ls[0]['predict_train'],alpha=0.7)
# elif len(col) != 1:
    
#   for i in range(len(col)):
#     plt.figure(figsize=(20,5))
#     plt.title(col[i])
#     plt.plot(ls[i]['y_train'],alpha=0.7)
#     plt.plot(ls[i]['predict_train'],alpha=0.7)


# In[ ]:




