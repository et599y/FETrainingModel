#!/usr/bin/env python
# coding: utf-8

# In[80]:


from joblib import dump, load
import pandas as pd
import numpy as np
import json
import sys


filepath = sys.argv[1] #path+file
minmaxpath = sys.argv[2] #path+file
modelpath = sys.argv[3] #path+file
_col = sys.argv[4] #y_col name
jsonpath = sys.argv[5] #path

# filepath = 'TC3000005_predict_pre.csv'
# minmaxpath =  'min_max.csv'
# modelpath = 'XGB_0.7_0.2_Auto_C10_14℃冰機02運轉電流百分比.h5'
# _col = 'C10_14℃冰機02運轉電流百分比'
# jsonpath = ''

def nor_load (df1):
    dd = pd.read_csv(minmaxpath,index_col=0)
    for i in range(df1.shape[1]-1):
        df1.iloc[:,1+i] = (df1.iloc[:,1+i]-dd.iloc[:,i]['min'])/(dd.iloc[:,i]['max']-dd .iloc[:,i]['min'])
    return df1

def denor(array,col):
    dd = pd.read_csv(minmaxpath,index_col=0)
    denormalized = array*(dd.T['max'][col]-dd.T['min'][col])+dd.T['min'][col]
    #print(col)
    return denormalized

def predic(modelpath,filepath,minmaxpath,_col):
    df = pd.read_csv(filepath,index_col=0)
    df1 = nor_load(df.iloc[:,1:])
    try:
        X = np.array(df1.drop([_col],axis=1))
        y = np.array(df[_col])
    except:
        X = np.array(df1.iloc[:,1:])
        y = None
    mo = load(modelpath)
    return mo.predict(X), y

ls,ls2 = [],[]
predict_value={}

predict_value['Column'] = _col
predict_value['predict'] = denor(predic(modelpath,filepath,minmaxpath,_col)[0],_col).tolist()

try: 
    predict_value['y'] = predic(modelpath,filepath,minmaxpath,_col)[1].tolist()
    error_value={}    
    error_value['Column'] = _col
    error_value['predict_error'] = (np.asarray(predict_value['predict']) - np.asarray(predict_value['y'])).tolist()
except:
    predict_value['y'] = ""

ls.append(predict_value)
ls2.append(error_value)

with open(jsonpath+'predict_predict_value.json', 'w', encoding='utf8') as json_file:
    json.dump(ls, json_file, ensure_ascii=False)
    
with open(jsonpath+'predict_error_value.json', 'w', encoding='utf8') as json_file:
    json.dump(ls2, json_file, ensure_ascii=False)

tmp = pd.DataFrame()
tmp['predict'] = predict_value['predict']
tmp.to_csv(jsonpath + 'predict.csv')


# In[81]:


# import matplotlib.pyplot as plt
# plt.figure(figsize=(20,5))
# plt.title(_col)
# plt.plot(ls[0]['predict'],alpha=0.7)
# plt.plot(ls[0]['y'],alpha=0.7)


# In[ ]:




