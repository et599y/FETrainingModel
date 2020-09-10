
import sys
import json
from json import JSONEncoder
import pandas as pd
import numpy as np

#################
csv_path = sys.argv[1]
save_path = sys.argv[2]
#sample
# csv_path = r'C:\Users\AUO\Downloads\test.csv'
# save_path = r'C:\Users\AUO\Downloads\result.json'
#################

class NumpyArrayEncoder(JSONEncoder):
  def default(self, obj):
    if isinstance(obj, np.ndarray):
      return obj.tolist()
    return JSONEncoder.default(self, obj)

df1 = pd.read_csv(csv_path,index_col=0)
for t in range(1,df1.shape[1]):
    df1.iloc[:,t] = pd.to_numeric(df1.iloc[:,t], errors='coerce')
des = df1.describe()
col = list(df1.describe().columns)
index = list(df1.describe().iloc[:,1].index)
ls = []
for i in range(len(col)):
    dict_ = {}
    dict_['col'] = col[i]
    for c in range(len(index)):
        dict_[index[c]] = str(des.iloc[:,i][index[c]].round(5))
    ls.append(dict_)

with open(save_path, 'w', encoding='utf8') as json_file:
      json.dump(ls, json_file, ensure_ascii=False, cls=NumpyArrayEncoder)




