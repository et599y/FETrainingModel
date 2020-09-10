#!/usr/bin/env python
# coding: utf-8

# In[54]:


import sys
import json
import argparse
import numpy as np
import pandas as pd
from math import sqrt
from json import JSONEncoder
from joblib import dump, load
from multiprocessing import cpu_count
from sklearn import preprocessing,metrics,linear_model
from sklearn.inspection import permutation_importance
#from sklearn.ensemble import RandomForestRegressor
from xgboost.sklearn import XGBRegressor,XGBRFRegressor
from sklearn.model_selection import RandomizedSearchCV,TimeSeriesSplit

class NumpyArrayEncoder(JSONEncoder):
  def default(self, obj):
    if isinstance(obj, np.ndarray):
      return obj.tolist()
    return JSONEncoder.default(self, obj)

def save (re) :    
    
    #True & Predict
    names = ['y_train', 'predict_train','y_val', 'predict_val', 'y_test', 'predict_test']
    predict_value={}
    for i in range(len(names)):
        predict_value['Column'] = _col
        try:
            #re =  0 keys, 1 result, |2 y_train, 3 predict_train, 4 y_val, 5 predict_val, 6 y_test, 7 predict_test|, 8 model
            predict_value[names[i]] = re[i+2].tolist()
        except:
            predict_value[names[i]] = ""
    import json
    with open(jsonpath+'training_predict_value.json', 'w', encoding='utf8') as json_file:
          json.dump([predict_value], json_file, ensure_ascii=False, cls=NumpyArrayEncoder)
        
    #Predict - True
    error_value={}    
    error_value['Column'] = _col
    error_value['train_error'] = (re[3]-re[2]).tolist() #predict_train-y_train
    error_value['val_error'] = (re[5]-re[4]).tolist()#predict_val-y_val
    try:
        error_value['test_error'] = (re[7]-re[6]).tolist()#predict_test-y_test
    except:
        error_value['test_error'] =""
  
    with open(jsonpath+'training_error_value.json', 'w', encoding='utf8') as json_file:
        json.dump([error_value], json_file, ensure_ascii=False)
        
    

    key_value = []
    for i,t in zip(re[0],re[1]):
        key_value_dict = {}
        key_value_dict['keys'] = i
        key_value_dict['result'] = t
        key_value.append(key_value_dict)
        #print(i,t)
    with open(jsonpath+'key_value.json', 'w', encoding='utf8') as json_file:
        json.dump(key_value, json_file, ensure_ascii=False)
   #score
    def mean_absolute_percentage_error(y_true, y_pred): 
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        return np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    
    score = pd.DataFrame({'mode' :['MAE','MSE','RMSE','MAPE','R2']})
    score = score.set_index('mode')
    y,p,t = [re[2],re[4],re[6]],[re[3],re[5],re[7]],['train','val','test']

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
    score.to_csv(scorepath)

def nor (df1):
    min_max_df = pd.DataFrame(index=['min','max'])
    for i in range(df1.shape[1]):
        value_min = df1.iloc[:,i].min() - df1.iloc[:,i].std()
        value_max = df1.iloc[:,i].max() + df1.iloc[:,i].std()
        min_max_df[df1.columns[i]] = [value_min,value_max]
        df1.iloc[:,i] = (df1.iloc[:,i]-value_min)/(value_max-value_min)
    min_max_df.to_csv(minmaxpath)
    return df1

def denor(array,col):
    dd = pd.read_csv(minmaxpath,index_col=0)
    denormalized = array*(dd.T['max'][col]-dd.T['min'][col])+dd.T['min'][col]
    return denormalized

def pre(df1, col, pro1, pro2):
  
    df1 = nor(df1.iloc[:,1:])

    X = df1.drop([col],axis=1)

    keys = list([L for L in X.columns])

    X = np.array(X)

    y = np.array(df1[col])

    L1,L2  = int(len(y)*float(pro1)),int(len(y)*float(pro1+pro2))        
    if pro1+pro2 == 1:           
        X_train, y_train = X[:L1],y[:L1]            
        X_val, y_val = X[L1:],y[L1:]            
        X_test, y_test = None,None

    if pro1+pro2 != 1:            
        X_train, y_train = X[:L1],y[:L1]
        X_val, y_val = X[L1:L2],y[L1:L2]
        X_test, y_test = X[L2:],y[L2:]

    return X_train, y_train, X_val, y_val, X_test, y_test, keys

def modeling(df1, col, pro1, pro2,_model):

    cpu_n = int(cpu_count()) // 2
      
    X_train, y_train, X_val, y_val, X_test, y_test, keys = pre(df1, col, pro1, pro2)
    eval_set = [(X_train, y_train), (X_val, y_val)]

    if _model[0] == 'XGB' :
        
        if _model[1] != 0:
            model = XGBRegressor(
                        n_estimators = _model[1],  #100~500
                        max_depth = _model[2] #1~16
                        ).fit(X_train,y_train,early_stopping_rounds=200,eval_set = eval_set, eval_metric=["rmse"],verbose = False)
        #Auto XGB
        #set param range
        else:
            param_test = {
                'n_estimators': [int(x) for x in np.linspace(start = 200, stop = 2000, num = 10)],
                'max_depth':list(range(3,10,1)),
                'min_child_weight':list(range(1,6,1))}
            #set cv
            model_random = RandomizedSearchCV(
                estimator = XGBRegressor(), 
                param_distributions = param_test, 
                n_iter = 100, 
                cv = TimeSeriesSplit(max_train_size=None, n_splits=5),
                verbose=0, 
                random_state=42, 
                n_jobs = cpu_n)
            
            # fit cv + train on val set to get best param

            model_random.fit(X_train,y_train,eval_set = [(X_val,y_val)],eval_metric='mae',early_stopping_rounds=30,verbose=0)       

            #set best param
            model = XGBRegressor(
                n_estimators = model_random.best_params_['n_estimators'],
                max_depth = model_random.best_params_['max_depth'],
                min_child_weight = model_random.best_params_['min_child_weight'])
            
            # fit train 
            model.fit(X_train, y_train)
            #print(model_random.best_params_)

    elif _model[0] == 'RF' :
        if _model[1] != 0:
          model = XGBRFRegressor(
                      n_estimators = _model[1],  #100~500
                      max_depth = _model[2], #1~16
                      ).fit(X_train,y_train)
        else:
          
          #Auto RF
          #set param range     
          param_test = {
                'n_estimators': [int(x) for x in np.linspace(start = 200, stop = 2000, num = 10)],
                'max_depth':list(range(3,10,1)),
                'min_child_weight':list(range(1,6,1))}
          #set cv
          model_random = RandomizedSearchCV(estimator = XGBRFRegressor(), 
                                            param_distributions = param_test, 
                                            n_iter = 100, 
                                            cv = TimeSeriesSplit(max_train_size=None, n_splits=5),
                                            return_train_score = True,
                                            verbose=0, 
                                            n_jobs = cpu_n)
          # fit cv + train on val set to get best param
          model_random.fit(X_train,y_train,eval_set = [(X_val,y_val)],eval_metric='mae',early_stopping_rounds=30,verbose=0)            
          
          #set best param
          model = XGBRFRegressor(
                n_estimators = model_random.best_params_['n_estimators'],
                max_depth = model_random.best_params_['max_depth'],
                min_child_weight = model_random.best_params_['min_child_weight']
                                        )
          # fit train 
          model.fit(X_train, y_train)
          #print(model_random.best_params_)
  
    elif _model[0] == 'LASSO' :

        model = linear_model.Lasso(
                alpha=_model[1],#0~1
                max_iter=_model[2] #1000~
                  ).fit(X_train,y_train)
    #get importance feature
    result = permutation_importance(model, X_train, y_train)['importances_mean']

    predict_train = model.predict(X_train)
    predict_val = model.predict(X_val)
    predict_test = model.predict(X_test) if pro2 != 0 else None
    
    y_train = denor(y_train,col)
    predict_train = denor(predict_train,col)

    y_val = denor(y_val,col)
    predict_val = denor(predict_val,col)

    try:
        y_test = denor(y_test,col)
        predict_test = denor(predict_test,col)
    except:
        pass

    return keys, result, y_train, predict_train, y_val, predict_val, y_test, predict_test, model

filepath = sys.argv[1]
_pro1 = float(sys.argv[4]) / 10
_pro2 = float(sys.argv[5]) / 10

_model1 = sys.argv[6]
_model2 = int(sys.argv[2])
_model3 = int(sys.argv[3])

jsonpath = sys.argv[7]
scorepath = jsonpath + "score.csv"
minmaxpath = jsonpath + "min_max.csv"
_col = sys.argv[8]

# filepath = 'C:/Users/AUO/source/repos/FETrainingModel/FETrainingModel/ProjectFiles/TC3/TC3000002/TC3000002_pre.csv'
# jsonpath = ''
# scorepath = 'scorepath.csv'
# #modelpath = 'modelpath.h5'
# minmaxpath = 'min_max.csv'
# _col = 'C10_14℃冰機02運轉電流百分比'
# _pro1 = 0.8
# _pro2 = 0.1
# _model1 = 'RF'
# _model2 = 0
# _model3 = 1

df = pd.read_csv(filepath,index_col=0)
re = modeling(df,_col,_pro1,_pro2,[_model1,_model2,_model3])
save(re)

if _model2 == 0:
    print(f'{_model1}_{_pro1}_{_pro2}_Auto_{_col}')
    dump(re[8], jsonpath+f'{_model1}_{_pro1}_{_pro2}_Auto_{_col}.h5')
else :
    print(f'{_model1}_{_pro1}_{_pro2}_{_model2}_{_model3}_{_col}')
    dump(re[8], jsonpath+f'{_model1}_{_pro1}_{_pro2}_{_model2}_{_model3}_{_col}.h5')

