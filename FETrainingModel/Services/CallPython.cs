using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;

namespace FETrainingModel.Services
{
    public class CallPython
    {
        private Process _p = null;

        public void CMD()
        {
            _p = new Process();
            _p.StartInfo.FileName = ConfigurationSettings.AppSettings["CMD"];//CMD執行檔案
            _p.StartInfo.UseShellExecute = false;//是否使用作業系統shell啟動
            _p.StartInfo.RedirectStandardInput = true;//接受來自呼叫程式的輸入資訊
            _p.StartInfo.RedirectStandardOutput = true;//由呼叫程式獲取輸出資訊
            _p.StartInfo.RedirectStandardError = true;//重定向標準錯誤輸出
            _p.StartInfo.CreateNoWindow = false; //不跳出cmd視窗
        }

        public string Execute(string args)
        {
            _p.StartInfo.Arguments = args; //執行檔案、參數
            _p.Start();
            string output = _p.StandardOutput.ReadToEnd();
            _p.WaitForExit();
            _p.Close();

            return output;
        }

        private void GetLSTMParameter(string Code, out string Units, out string Activation, out string Dropout)
        {
            var _ParList = Code.Split(',');
            var _Activation = _ParList[1].Split('=');
            var _Dropout = _ParList[2].Split('=');
            Units = Regex.Replace(_ParList[0], "[^0-9]", "");
            Dropout = Regex.Replace(_Dropout[1], "[^0-9,.]+", "");
            Activation = _Activation[1];
        }

        public string SplitModel(string data, bool col) //col=1 == false, col>1 == true
        {
            string _ModelCode="";
            var ColData = data.Replace("\r\n", "").Split(';');
            
            if(ColData.Count() <= 2 && col == false) //只有一層的單col return_sequences需=false
            {
                GetLSTMParameter(ColData[0].ToString(), out string Units, out string Activation, out string Dropout);
                _ModelCode += $"  model.add(LSTM({Units}, activation='{Activation}',  input_shape=(pastDay, X_train.shape[2]),dropout={Dropout}))";
            }
            else
            {
                for (int i = 0; i < ColData.Count() - 1; i++)
                {
                    GetLSTMParameter(ColData[i].ToString(), out string Units, out string Activation, out string Dropout);
                    if (i == 0)
                        _ModelCode += $"  model.add(LSTM({Units}, activation='{Activation}', return_sequences=True, input_shape=(pastDay, X_train.shape[2]),dropout={Dropout}))";
                    else if (i == ColData.Count() - 2)
                        if (col == false)
                            _ModelCode += $";  model.add(LSTM({Units}, activation='{Activation}', dropout={Dropout}))";
                        else
                            _ModelCode += $";  model.add(LSTM({Units}, activation='{Activation}', return_sequences=True, dropout={Dropout}))";
                    else
                        _ModelCode += $";  model.add(LSTM({Units}, activation='{Activation}', return_sequences=True, dropout={Dropout}))";
                }
            }
                    
            return _ModelCode;
        }

        public void WriteLSTM(string ModelCode, string LstmPath, bool col)
        {
            //寫進LSTM.py file
            var _Code = new List<string>();
            var _Mark = false;
            var _line = "";
            string _start, _end;
            if (col == true) //multi y 
            {
                _start = "#Start building multi models";
                _end = "#Finish building multi models";
            }
            else // single y
            {
                _start = "#Start building models";
                _end = "#Finish building  models";
            }

            using (StreamReader _Py = new StreamReader(LstmPath))
            {
                while ((_line = _Py.ReadLine()) != null)
                {
                    if (_line == _start)
                    {
                        _Mark = true;
                        _Code.Add(_line);
                        var _CodeList = ModelCode.Split(';');
                        foreach (var Code in _CodeList)
                            _Code.Add(Code);
                    }
                    else if (_line == _end)
                        _Mark = false;
                    if (!_Mark)
                        _Code.Add(_line);
                }
                _Py.Close();
            }
            File.WriteAllLines(LstmPath, _Code);
        }
    }
}