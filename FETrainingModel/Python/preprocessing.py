import sys
import json
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer

def col (df_):
  #create columns NA>30% columns names
  missing_df = pd.DataFrame(df_.isna().sum().sort_values(ascending= False)).reset_index().rename(columns={"index": "col", 0: "missing_count"})
  missing_df['missing_rate'] = missing_df['missing_count']/len(df_)
  na_30 =  list(missing_df[missing_df['missing_rate']>0.3]['col'])
  
  #create columns unique=1 columns names
  not_different = []
  for i in range(df_.shape[1]):
    if len(df_.iloc[:,i].unique()) == 1:
      not_different.append(df_.columns[i])
    else:
      pass 
  # drop
  not_different.extend(na_30)
  tmp = list(set(not_different))
  df_ = df_.drop(tmp,axis=1).reset_index(drop=True)

  return df_, na_30, not_different

def abnormal (df_,abnormal_drop):

  #try to numeric else fill Nan
  for t in range(1,df_.shape[1]):
    df_.iloc[:,t] = pd.to_numeric(df_.iloc[:,t], errors='coerce')
  
  #count abnormal 
  c = 0
  for i in df_.isnull().sum(axis=1):
    if i != 0 :
      c = c + 1
  
  # drop or not
  if abnormal_drop == 1:
    df_ = df_.dropna().reset_index(drop=True)

  return df_,c

def outlier(df2,outlier_drop):
    
    #get outlier std*3
    l = np.array([])
    for t in range(1,df2.shape[1]):
        m = df2.iloc[:,t].mean()
        s = df2.iloc[:,t].std()*3
        c = np.append(np.where(df2.iloc[:,t] < m-(s*3))[0],np.where(df2.iloc[:,t] > m+(s*3))[0])
        l = np.append(l,c)
        l = np.unique(l[~np.isnan(l)]).astype('int64')
        df2.iloc[l,t] = None    
    if outlier_drop == 1 :
          df2 = df2.dropna().reset_index(drop=True)   
    return df2,len(l)

def fill_na(df_,mode):    
    modes1 = ['median','most_frequent','mean']
    modes2 = ['interp1d']
    modes3 = ['bfill', 'ffill'] #往前/往後    
    if mode in modes1:
        df_.iloc[:,1:] = SimpleImputer(strategy=mode,add_indicator=False).fit_transform(df_.iloc[:,1:].to_numpy())    
    
    elif mode in modes2: 
        from scipy.interpolate import interp1d
        df_ = df_.interpolate()   
    
    elif mode in modes3:
        df_ = df_.fillna(method=mode)
  
    else:
        pass
    na = df_.isna().sum().sum()
    df_ = df_.dropna().reset_index(drop=True)
    
    for i in range(df_.shape[1]):
        if len(df_.iloc[:,i].unique()) == 1:
            not_different.append(df_.columns[i])
        else:
            pass
        
    # tmp = list(set(not_different))
    # df_ = df_.drop(tmp,axis=1).reset_index(drop=True)
    
    return df_,na

##################  input parameter ########################## 
#傳進來的參數
filepath = sys.argv[1]  
_abnormal = int(sys.argv[2]) # 0:pass ,1:drop  
_outlier = int(sys.argv[3])  # 0:pass ,1:drop  
_fill = sys.argv[4]         #'median', 'most_frequent', 'mean', 'bfill', 'ffill', 'interp1d', 'not fill'
savepath = sys.argv[5]
corrpath = sys.argv[6]
_type = sys.argv[7] #'EDA'
drop_col_name = sys.argv[8] #'col1,col2' before preprocess
#sample
# filepath = r'C:\Users\AUO\source\repos\FETrainingModel\FETrainingModel\ProjectFiles\TC1\TC1000027\TC1000027.csv'       
# _abnormal = 0   
# _outlier = 0    
# _fill = "ffill"         
# savepath = r"C:\Users\AUO\source\repos\FETrainingModel\FETrainingModel\ProjectFiles\TC1\TC1000027\TC1000027_pre.csv"
# corrpath = r"C:\Users\AUO\source\repos\FETrainingModel\FETrainingModel\ProjectFiles\TC1\TC1000027\TC1000027_corr.csv"
# _type = 'null'
# drop_col_name = "C10 14℃冰機02蒸發器1趨近溫度,CR1 C/T To 14℃冰機冷卻水溫503".replace(' ','_').replace('\xa0','_')
#################################################################


df_ = pd.read_csv(filepath,encoding='utf-8')

#replace abnormal col name
for i in range(df_.shape[1]):
  df_ = df_.rename(columns={df_.columns[i]:df_.columns[i].replace(' ','_').replace('\xa0','_')})

#user choose col
try:
  df_ = df_.drop(drop_col_name.split(','),axis=1)
#if col='' pass
except:
  pass

#drop na>30% & not_differen columns
df1,na_30,not_different = col(df_) 

#drop abnormal
df2,ab_c = abnormal(df1,_abnormal) # 0:pass 1:drop

#drop outlier
df3,out_c = outlier(df2,_outlier) # 0:pass 1:drop

#choose fill_na type 
df4,na_c = fill_na(df3,_fill)

#output corr csv
if corrpath != 'null': #if corrpath = null do predict data process do not output corr csv
  df5 = df4.corr()
  df_corr = pd.DataFrame()
  df_corr['col1'] = np.repeat(df5.columns[1:].values,len(df5.columns)-1)
  df_corr['col2'] = np.tile(df5.columns[1:].values,len(df5.columns)-1)
  df_corr['value'] = np.array([df5.iloc[1:,i]for i in range(1,len(df5.columns))]).reshape(1,-1)[0]
  df_corr.to_csv(corrpath)# corrpath = sys.argv[6]

#if type = EDA output EDA result
if _type == 'EDA':
    print(df_.shape[0],              #原資料總數
          df4.shape[0],              #處理後筆數
          len(not_different),        #重複欄位數
          df_.shape[0]-df4.shape[0], #刪除總筆數
          df3.isna().sum().sum() - df4.isna().sum().sum(), #補值總補筆數 df3.isna().sum().sum() - df4.isna().sum().sum()
          df4.shape[1],              #欄位數
          sep='/')

#if type != EDA outpupt porcess result
else:
    #save finish file
    df4.to_csv(savepath, encoding="utf_8_sig")
    print(df_.isnull().sum().sum(), #before preprocessing count na
      na_30, #na>30% columns name
      not_different,  #value not different columns name
      ab_c,  #abnormal
      out_c, #outlier
      na_c, #can't fill count 
      sep = '/')