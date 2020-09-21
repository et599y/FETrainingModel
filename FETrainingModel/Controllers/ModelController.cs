using FETrainingModel.Models;
using FETrainingModel.Services;
using FETrainingModel.ViewModels;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using static FETrainingModel.Models.TrainingModel;

namespace FETrainingModel.Controllers
{
    public class ModelController : Controller
    {
        UserService userservice = new UserService();
        ProjectService projectservice = new ProjectService();
        ModelService modelservice = new ModelService();
        CallPython callpython = new CallPython();
        string pyPath = ConfigurationSettings.AppSettings["filePath"] + "Python/";
        string filePath = ConfigurationSettings.AppSettings["filePath"] + "ProjectFiles/"; 

        // GET: Model
        public ActionResult Index()
        {
            return View();
        }

        // 匯入資料
        [Authorize]
        public ActionResult ImportData(string ID, string mode)
        {
            Projects Data = projectservice.GetProjectData(ID);
            //紀錄ProjectID、Mode
            Session["ID"] = ID;
            Session["Mode"] = mode;
            if (mode == "1") //training
            {
                //模型進度
                if (Data.Process == 1)
                    return RedirectToAction("DataPreprocess", "Model");
                else if (Data.Process == 2)
                    return RedirectToAction("ChooseModel", "Model");
                else if (Data.Process == 3)
                    return RedirectToAction("DefineVariable", "Model");
                else if (Data.Process == 4)
                    return RedirectToAction("DefineVariable", "Model");
                else
                    return View(Data);
            }

            return View(Data);
        }
        [Authorize]
        [HttpPost]
        public ActionResult ImportData(HttpPostedFileBase FileUpload, Projects data)
        {
            string mode = Convert.ToString(Session["Mode"]);

            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath =filePath + user.Site + "/" + data.ProjectId + "/"; //設定路徑
            string path = MapPath;

            if(mode == "1")
            {
                //如果已有檔案刪除檔案
                foreach (string f in Directory.GetFileSystemEntries(path))
                {
                    if (System.IO.File.Exists(f))
                        System.IO.File.Delete(f);
                }                
                //檔案存至server
                FileUpload.SaveAs(path + Path.GetFileName(FileUpload.FileName));
                //csv檔encoding為utf8
                var csvdata = System.IO.File.ReadAllText(path + Path.GetFileName(FileUpload.FileName), Encoding.Default);
                System.IO.File.WriteAllText(path + data.ProjectId + ".csv", csvdata, Encoding.UTF8);
                System.IO.File.Delete(path + Path.GetFileName(FileUpload.FileName));

                var file = Directory.GetFiles(path, "*.csv", SearchOption.AllDirectories);
                //判斷第一欄須為時間格式且不可為空
                string[] lines = System.IO.File.ReadAllLines(file[0], Encoding.UTF8);
                for (int i = 1; i < lines.Length; i++)
                {
                    string[] line = lines[i].Trim().Split(',');
                    DateTime trydate;
                    if (DateTime.TryParse(line[0], out trydate))
                    {
                        continue;
                    }
                    else
                    {
                        ViewBag.output = "error";
                        return View(data);
                    }
                }

                //更新執行步驟&時間
                modelservice.UpdateProcess(data.ProjectId, 1);
            }
            else if(mode == "2")
            {
                string predictPath = path + data.ProjectId + "_predict.csv";
                //如果已有predict檔案 刪除檔案
                foreach (string f in Directory.GetFileSystemEntries(path))
                {
                    if (f == predictPath)
                        System.IO.File.Delete(f);
                }
                FileUpload.SaveAs(path + Path.GetFileName(FileUpload.FileName));
                //csv檔encoding為utf8
                var csvdata = System.IO.File.ReadAllText(path + Path.GetFileName(FileUpload.FileName), Encoding.Default);
                System.IO.File.WriteAllText(predictPath, csvdata, Encoding.UTF8);
                System.IO.File.Delete(path + Path.GetFileName(FileUpload.FileName));
            }

            return RedirectToAction("DataDescribe", "Model");
        }

        //資料分布
        [Authorize]
        public ActionResult DataDescribe()
        {
            string ProjectId = Convert.ToString(Session["ID"]);
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = filePath + user.Site + "/" + ProjectId + "/"; //設定路徑
            string path = MapPath;
            //執行資料分布
            string arg = $"{pyPath}describe.py {path + ProjectId + ".csv"} {path + "describe.json"}";
            callpython.CMD();
            callpython.Execute(arg);

            ViewBag.ProjectId = ProjectId;
            ViewBag.describePath = "../ProjectFiles/" + user.Site + "/" + ProjectId + "/" + "describe.json";

            return View();
        }

        // 資料處理
        [Authorize]
        public ActionResult DataPreprocess()
        {
            DataPreprocessViewModel view = new DataPreprocessViewModel();
            view.ProjectId = Convert.ToString(Session["ID"]);
            view.mode = Convert.ToString(Session["Mode"]);

            //讀檔案路徑
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = filePath + user.Site + "/" + view.ProjectId + "/";
            string path = MapPath + view.ProjectId;
            string file, savePath, corrPath;

            if (view.mode == "2") //predict
            {
                file = path + "_predict.csv";
                savePath = path + "_predict_pre.csv";
                corrPath = "null";
            }
            else
            {
                file = path + ".csv";
                savePath = path + "_pre.csv";
                corrPath = path + "_corr.csv";
                
            }
            //執行預處理
            string arg2 = $"{pyPath}preprocessing.py {file} {0} {0} {"interp1d"} {savePath} {corrPath} {"null"} {"null"}";
            callpython.CMD();
            string output = callpython.Execute(arg2);
            //存回傳結果
            string[] data = output.Split('/');
            DataPreprocess _pre = new DataPreprocess();
            _pre.isnull = data[0];
            _pre.DeleteCol = data[1].Substring(1).Substring(0, data[1].Length - 2).Split(',');
            _pre.SameCol = data[2].Substring(1).Substring(0, data[2].Length - 2).Split(',');
            _pre.abnormal = data[3];
            _pre.outlier = data[4];
            view.pre = _pre;

            //dropdownlist
            string[] lines = System.IO.File.ReadAllLines(file, Encoding.UTF8);
            view.ColList = lines[0].Trim().Split(',').Skip(1).ToArray(); //移除date，存入下拉式選單

            return View(view);
        }
        [Authorize]
        [HttpPost]
        public ActionResult DataPreprocess(DataPreprocessViewModel view)
        {
            //讀檔案路徑
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = filePath + user.Site + "/" + view.ProjectId + "/";
            string path = MapPath + view.ProjectId;
            string file, savePath, corrPath, select;
            if (view.mode == "2") //predict
            {
                file = path + "_predict.csv";
                savePath = path + "_predict_pre.csv";
                corrPath = "null";
            }
            else
            {
                file = path + ".csv";
                savePath = path + "_pre.csv";
                corrPath = path + "_corr.csv";
            }

            select = (view.Selected != null) ? String.Join(",", view.Selected.ToArray()) : "null"; //判斷selected是否有值
            //執行預處理
            string arg = $"{pyPath}preprocessing.py {file} {view.abnormal} {view.outlier} {view.fill} {savePath} {corrPath} {"null"} {select.Replace(' ', '_')}"; //字串不可含空白
            callpython.CMD();
            string output = callpython.Execute(arg);
            
            //無法補值
            string[] data = output.Split('/');
            DataPreprocess pre = new DataPreprocess();
            pre.cantfill = data[5];
       
            //更新執行步驟&時間
            if (view.mode == "1")
            {
                modelservice.DataSplit(view.ProjectId, view.TrainVal, view.ValidVal, view.TestVal); //存train/valid/test
                modelservice.UpdateProcess(view.ProjectId, 2);
            }
                
            return RedirectToAction("ChooseModel", "Model", pre);
        }

        // 選擇Model
        [Authorize]
        public ActionResult ChooseModel(DataPreprocess data)
        {
            ModelViewModel modelView = new ModelViewModel();
            modelView.cantfill = data.cantfill;
            modelView.ProjectId = Convert.ToString(Session["ID"]);
            modelView.mode = Convert.ToString(Session["Mode"]);
            if(modelView.mode == "2")
            {         
                Users user = userservice.FindUser(User.Identity.Name);
                string MapPath = filePath + user.Site + "/" + modelView.ProjectId + "/";
                string path = MapPath;

                //判斷train, predict資料欄位是否一致
                var file1 = Directory.GetFiles(path, modelView.ProjectId + "_pre.csv", SearchOption.AllDirectories);
                var file2 = Directory.GetFiles(path, "*predict_pre.csv", SearchOption.AllDirectories);
                string[] lines1 = System.IO.File.ReadAllLines(file1[0], Encoding.UTF8);
                string[] lines2 = System.IO.File.ReadAllLines(file2[0], Encoding.UTF8);
                bool compare = lines1[0].SequenceEqual(lines2[0]);
                if (compare == false)
                    return RedirectToAction("ProjectList","Project", new { compare = compare});

                modelView.ModelList = modelservice.GetAllModelList(modelView.ProjectId).ToList();
                string file = path + modelView.ProjectId + "_predict_pre.csv";
                string[] lines = System.IO.File.ReadAllLines(file, Encoding.UTF8);
                modelView.ColList = lines[0].Trim().Split(',').Skip(2).ToArray(); //移除index, date，存入下拉式選單
            }
                
            return View(modelView);
        }
        [Authorize]
        [HttpPost]
        public ActionResult ChooseModel(ModelViewModel data)
        {
            if(data.mode == "1")
            {
                //儲存選擇的model
                modelservice.SaveModel(Convert.ToString(Session["ID"]), data.model);
                //更新執行步驟&時間
                modelservice.UpdateProcess(Convert.ToString(Session["ID"]), 3);
                return RedirectToAction("DefineVariable", "Model");
            }
            else if(data.mode == "2")
            {
                //predict
                string ProjectId = Convert.ToString(Session["ID"]);
                Users user = userservice.FindUser(User.Identity.Name);
                string MapPath = filePath + user.Site + "/" + ProjectId + "/";
                string path = MapPath;
                string arg = "";
                Model moedeldata = modelservice.GetModelData(ProjectId, data.model);
                if (projectservice.GetProjectData(ProjectId).Model == "LSTM")
                    arg = $"{pyPath}LSTM_predict_v3.py {path + data.model.Replace("\r\n", "") + ".h5"} {path + ProjectId + "_predict_pre.csv"} {moedeldata.y} {path + "min_max.csv"} {path}";
                else
                    arg = $"{pyPath}predict_v3.py {path + ProjectId + "_predict_pre.csv"} {path + "min_max.csv"} {path + data.model.Replace("\r\n", "") + ".h5"} {moedeldata.y} {path} ";
                callpython.CMD();
                string output = callpython.Execute(arg);
                return RedirectToAction("PredictResult", "Model");
            }

            return View(data);
        }

        [Authorize]
        public ActionResult PredictResult()
        {
            //讀檔案路徑
            string ProjectId = Convert.ToString(Session["ID"]);
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = "../ProjectFiles/" + user.Site + "/" + ProjectId + "/";

            ViewBag.jsonPath = MapPath + "predict_predict_value.json";
            ViewBag.csvPath = MapPath + "predict.csv";
            ViewBag.prePath = MapPath + ProjectId + "_predict_pre.csv";
            ViewBag.errorPath = MapPath + "predict_error_value.json";
            return View();
        }

        // 定義參數
        [Authorize]
        public ActionResult DefineVariable()
        {
            //拿model 
            string ProjectId = Convert.ToString(Session["ID"]);
            Projects data = projectservice.GetProjectData(ProjectId);

            ModelViewModel modelView = new ModelViewModel();

            //讀檔案路徑的所有欄位名稱
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = filePath + user.Site + "/" + ProjectId + "/";
            string path = MapPath + ProjectId;
            string file = path + "_pre.csv";
            string[] lines = System.IO.File.ReadAllLines(file, Encoding.UTF8);
            modelView.ColList = lines[0].Trim().Split(',').Skip(2).ToArray(); //移除第一欄index、第二欄日期，存入下拉式選單
            modelView.model = data.Model;
            modelView.ProjectId = ProjectId;

            //LSTM activationList
            String[] activations = { "tanh", "relu", "sigmoid", "hard_sigmoid", "softmax", "elu", "selu", "softplus", "softsign" };
            modelView.activationList = activations;

            return View(modelView);
        }
        [Authorize]
        [HttpPost]
        public ActionResult DefineVariable(ModelViewModel modelData)
        {
            //讀檔案路徑
            string ProjectId = Convert.ToString(Session["ID"]);
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = filePath + user.Site + "/" + ProjectId + "/";
            string path = MapPath;
            string file = path + ProjectId + "_pre.csv";

            Projects data = projectservice.GetProjectData(ProjectId); //拿train/valid/test data 

            //執行model
            string arg = "";
            if (data.Model =="RF" || data.Model == "XGB")
                arg = $"{pyPath}Auto_ML_v3.py {file} {modelData.rf.n_estimators} {modelData.rf.max_depth} {data.TrainVal} {data.ValidVal} {data.Model} {path} {modelData.Selected[0]}";
            else if(data.Model == "LASSO")
                arg = $"{pyPath}Auto_ML_v3.py {file} {modelData.lasso.alpha} {modelData.lasso.max_iter} {data.TrainVal} {data.ValidVal} {data.Model} {path} {modelData.Selected[0]}";
            else if(data.Model == "LSTM")
            {
                if (modelData.lstm.model == null)
                {
                    modelData.ProjectId = ProjectId;
                    string[] line = System.IO.File.ReadAllLines(file, Encoding.UTF8);
                    modelData.ColList = line[0].Trim().Split(',').Skip(2).ToArray(); //移除第一欄index、第二欄日期，存入下拉式選單
                    modelData.model = "LSTM";
                    String[] activations = { "tanh", "relu", "sigmoid", "hard_sigmoid", "softmax", "elu", "selu", "softplus", "softsign" };
                    modelData.activationList = activations;
                    modelData.preview = true;
                    return View(modelData);
                }
                else
                {
                    var select = String.Join(",", modelData.Selected.ToArray()); // multi y to string
                    var lstmPath = $"{pyPath}m2m_v4.py";
                    bool col = (modelData.Selected.Count() > 1) ? true : false; //判斷col, col=1 == false, col>1 == true
                    callpython.WriteLSTM(callpython.SplitModel(modelData.lstm.model, col), lstmPath, col); 
                    arg = $"{pyPath}m2m_v4.py {file} {select} {path} {data.TrainVal} {data.ValidVal} {modelData.lstm.trainging} {modelData.lstm.predict} {modelData.lstm.epoch}";
                }
            }
            callpython.CMD();
            string output = callpython.Execute(arg);

            //Get score file data
            var scorefile = Directory.GetFiles(path, "score*", SearchOption.AllDirectories);
            string[] lines = System.IO.File.ReadAllLines(scorefile[0], Encoding.UTF8);
            //將val data存進model table
            Model modeldata = new Model();
            modeldata.ProjectId = ProjectId;
            modeldata.CreateTime = DateTime.Now;
            modeldata.MAE = Convert.ToDouble(lines[1].Trim().Split(',')[2]);
            modeldata.MSE = Convert.ToDouble(lines[2].Trim().Split(',')[2]);
            modeldata.RMSE = Convert.ToDouble(lines[3].Trim().Split(',')[2]);
            modeldata.MAPE = Convert.ToDouble(lines[4].Trim().Split(',')[2]);
            modeldata.R2 = Convert.ToDouble(lines[5].Trim().Split(',')[2]);
            modeldata.Name = output;
            modeldata.y = String.Join(",", modelData.Selected.ToArray());
            modelservice.SaveTraing(modeldata);

            //更新執行步驟&時間
            modelservice.UpdateProcess(Convert.ToString(Session["ID"]), 4);

            return RedirectToAction("Result", "Model");
        }

        // 結果畫面
        [Authorize]
        public ActionResult Result()
        {
            //讀檔案路徑
            string ProjectId = Convert.ToString(Session["ID"]);
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = "../ProjectFiles/" + user.Site + "/" + ProjectId + "/";
            string path = MapPath;
            ModelViewModel modelView = new ModelViewModel();
            modelView.ModelList = modelservice.GetAllModelList(ProjectId).ToList();
            
            var file2 = Directory.GetFiles(filePath + user.Site + "/" + ProjectId + "/", "key_value.json", SearchOption.AllDirectories).Count();

            ViewBag.modelPath = MapPath;
            ViewBag.prePath = MapPath + ProjectId + "_pre.csv";
            ViewBag.minmaxPath = MapPath + "min_max.csv";
            ViewBag.predictPath =  "../Python/predict_v3.py";
            ViewBag.jsonPath = MapPath + "training_predict_value.json";
            ViewBag.errorPath = MapPath + "training_error_value.json";
            ViewBag.bubblePath = (Directory.GetFiles(filePath + user.Site + "/" + ProjectId + "/", "key_value.json", SearchOption.AllDirectories).Count() == 0) ? null : MapPath + "key_value.json";
            
            return View(modelView);
        }

        [Authorize]
        public ActionResult DataExplore(string ID)
        {
            //讀檔案路徑
            Users user = userservice.FindUser(User.Identity.Name);
            string MapPath = "../../ProjectFiles/" + user.Site + "/" + ID + "/";
            ViewBag.prePath = MapPath + ID + "_pre.csv";
            ViewBag.corrPath = MapPath + ID + "_corr.csv";

            //執行EDA
            string path = MapPath + ID;
            string arg = $"{pyPath}preprocessing.py {filePath + user.Site + "/" + ID + "/" + ID + ".csv"} {0} {0} {0} {"null"} {"null"} {"EDA"} {"null"}";
            callpython.CMD();
            string output = callpython.Execute(arg);
            DataPreprocess eda = new DataPreprocess();
            string[] data = output.Split('/');
            eda.col1 = data[0];
            eda.col2 = data[1];
            eda.col3 = data[2];
            eda.col4 = data[3];
            eda.col5 = data[4];
            eda.col6 = data[5];
            return View(eda);
        }
    }
}