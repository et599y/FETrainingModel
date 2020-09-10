#!/usr/bin/env python
# coding: utf-8

# In[18]:


import tensorflow as tf
import keras
import numpy as np
import pandas as pd
import json
import sys
from json import JSONEncoder
from sklearn import metrics
from keras.models import Sequential
from keras.layers import LSTM,Dense,RepeatVector,TimeDistributed,Flatten,Reshape
from keras.callbacks import EarlyStopping, ModelCheckpoint
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)

def pre(X, pro1, pro2):
    L1,L2  = int(len(X)*float(pro1)),int(len(X)*float(pro1+pro2))        
    if pro1+pro2 == 1:           
        train = X[:L1]           
        val = X[L1:]           
        test = None
    if pro1+pro2 != 1:
        train = X[:L1]
        val = X[L1:L2]
        test = X[L2:]
    return train, val, test

def nor (df1):
    min_max_df = pd.DataFrame(index=['min','max'])
    for i in range(df1.shape[1]-1):
        value_min = df1.iloc[:,1+i].min() - df1.iloc[:,1+i].std()
        value_max = df1.iloc[:,1+i].max() + df1.iloc[:,1+i].std()
        min_max_df[df1.columns[1+i]] = [value_min,value_max]
        df1.iloc[:,1+i] = (df1.iloc[:,1+i]-value_min)/(value_max-value_min)
    min_max_df.to_csv(minmaxpath)
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

def result():
  
  predict_train, y_train_denor = predict_multi_denor(X_train,col,'pre'),predict_multi_denor(y_train,col,'y')
  predict_val, y_val_denor = predict_multi_denor(X_val,col,'pre'),predict_multi_denor(y_val,col,'y')
  try:
    predict_test, y_test_denor = predict_multi_denor(X_test,col,'pre'),predict_multi_denor(y_test,col,'y')
  except:
    predict_test = None
    y_test_denor = None

  return y_train_denor, predict_train, y_val_denor, predict_val, y_test_denor, predict_test

class NumpyArrayEncoder(JSONEncoder):
  def default(self, obj):
    if isinstance(obj, np.ndarray):
      return obj.tolist()
    return JSONEncoder.default(self, obj)

##################################################################
# df1 = pd.read_csv('C:\\Users\\AUO\\source\\repos\\FETrainingModel\\FETrainingModel\\ProjectFiles\\TC1\\TC1000025\\TC1000025_pre.csv',index_col=0)

# col = ["TOC_out"]

# col = 'DO_Areation_2,TOC_out'.split(',')

# minmaxpath = 'minmax.csv'
# path = ''
# pro1 = 0.7
# pro2 = 0.1
# pastDay = 7
# futureDay = 3
# epochs = 2

filePath = sys.argv[1]
df1 = pd.read_csv(filePath,index_col=0)
col = sys.argv[2].split(',')
# col = ['TOC_in_total','TOC_out']
path = sys.argv[3]
minmaxpath = path + 'min_max.csv'
pro1 = float(sys.argv[4]) / 10
pro2 = float(sys.argv[5]) / 10
pastDay = int(sys.argv[6])
futureDay = int(sys.argv[7])
epochs = int(sys.argv[8])
################################################################
df = nor(df1).iloc[:,1:]
X, y = buildTrain(df, pastDay, futureDay, col)

X_train, X_val, X_test = pre(X, pro1, pro2)
y_train, y_val, y_test = pre(y, pro1, pro2)

if len(col) == 1:
    y_train = y_train.reshape(y_train.shape[0],y_train.shape[1])
    y_val = y_val.reshape(y_val.shape[0],y_val.shape[1])
    try:
        y_test = y_test.reshape(y_test.shape[0],y_test.shape[1])
    except:
        y_test = None

if len(col) == 1:
  model = Sequential()
#Start building models
  model.add(LSTM(10, activation='tanh', return_sequences=True, input_shape=(pastDay, X_train.shape[2]),dropout=0.2))
  model.add(LSTM(10, activation='tanh', dropout=0.2))
#Finish building  models

  model.add(Dense(futureDay)) #if col = 1 Dense=futureDay
  model.compile(optimizer='adam', loss='mse')

elif len(col) != 1:
  model = Sequential()

#Start building multi models
  model.add(LSTM(10, activation='tanh', return_sequences=True, input_shape=(pastDay, X_train.shape[2]),dropout=0.2))
  model.add(LSTM(10, activation='tanh', return_sequences=True, dropout=0.2))
#Finish building multi models

  model.add(LSTM(futureDay*4, return_sequences=True)) # make pastDay*futureDay
  model.add(Flatten()) # make 1D
  model.add(Reshape((futureDay, pastDay*4))) # make futureDay*pastDay
  model.add(Dense(len(col))) #if col>1 Dense=len(col)
  model.compile(optimizer='adam', loss='mse')

callback = EarlyStopping(monitor="val_loss", patience=50, verbose=0, mode="min")
bestmodel = ModelCheckpoint(path + f'LSTM_{pro1}_{pro2}_{pastDay}_{futureDay}_{epochs}.h5', monitor='val_loss', verbose=0, save_best_only=False, save_weights_only=False, mode='auto', period=1)
model.fit(X_train, y_train, epochs=epochs, batch_size=128, validation_data=(X_val, y_val), callbacks=[callback,bestmodel], verbose=0)
print(f'LSTM_{pro1}_{pro2}_{pastDay}_{futureDay}_{epochs}.h5')

#json######################################################0814######################################
names = ['y_train', 'predict_train','y_val', 'predict_val', 'y_test', 'predict_test']
re = result()
# re = y_train_denor, predict_train, y_val_denor, predict_val, y_test_denor, predict_test
ls,ls2 = [], []
for c in range(len(col)):
    predict_value={}
    predict_value['Column'] = col[c]
    
    error_value={}    
    error_value['Column'] = col[c]
    error_value['train_error'] = (re[1][c]-re[0][c]).tolist() #predict_train-y_train
    error_value['val_error'] = (re[3][c]-re[2][c]).tolist()#predict_val-y_val
    try:
        error_value['test_error'] = (re[5][c]-re[4][c]).tolist()#predict_test-y_test
    except:
        error_value['test_error'] =""
    ls2.append(error_value) 
    
    for i in range(len(names)):
        try:
            predict_value[names[i]] = re[i][c].tolist()
        except:
            predict_value[names[i]] = ""
    ls.append(predict_value)
with open(path+'training_predict_value.json', 'w', encoding='utf8') as json_file:
      json.dump(ls, json_file, ensure_ascii=False, cls=NumpyArrayEncoder)
         
with open(path+'training_error_value.json', 'w', encoding='utf8') as json_file:
    json.dump(ls2, json_file, ensure_ascii=False)
######################################################################################################  



#score
def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100
score = pd.DataFrame({'mode' :['MAE','MSE','RMSE','MAPE','R2']})
score = score.set_index('mode')
y,p,t = [re[0],re[2],re[4]],[re[1],re[3],re[5]],['train','val','test']

r = 2 if predict_value['y_val'] == '' else 3

for i in range(r): 
        try:
            score[t[i]] = [
                round(metrics.mean_absolute_error(y[i], p[i]),2),
                round(metrics.mean_squared_error(y[i], p[i]),2),
                round(np.linalg.norm(np.array(y[i]) - np.array(p[i])) / np.sqrt(len(p[i])),2),#rmse
                round(mean_absolute_percentage_error(y[i], p[i]),2),
                round(metrics.r2_score(y[i], p[i]),2)
                
                          ]
        except:
            pass
score.to_csv(path+'score.csv')


# In[28]:


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


# # In[16]:


# import matplotlib.pyplot as plt
# plt.figure(figsize=(20,5))
# if len(col) == 1:
#   plt.title(col[0])
#   plt.plot(ls[0]['y_val'],alpha=0.7)
#   plt.plot(ls[0]['predict_val'],alpha=0.7)
# elif len(col) != 1:
#   for i in range(len(col)):
#     plt.figure(figsize=(20,5))
#     plt.title(col[i])
#     plt.plot(ls[i]['y_val'],alpha=0.7)
#     plt.plot(ls[i]['predict_val'],alpha=0.7)


# # In[17]:


# import matplotlib.pyplot as plt
# plt.figure(figsize=(20,5))
# if len(col) == 1:
#   plt.title(col[0])
#   plt.plot(ls[0]['y_test'],alpha=0.7)
#   plt.plot(ls[0]['predict_test'],alpha=0.7)
# elif len(col) != 1:
#   for i in range(len(col)):
#     plt.figure(figsize=(20,5))
#     plt.title(col[i])
#     plt.plot(ls[i]['y_train'],alpha=0.7)
#     plt.plot(ls[i]['predict_train'],alpha=0.7)


# In[ ]:




