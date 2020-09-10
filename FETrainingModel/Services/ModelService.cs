using FETrainingModel.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;

namespace FETrainingModel.Services
{
    public class ModelService
    {
        FEModelEntities db = new FEModelEntities();
        UserService userservice = new UserService();
        //更新執行步驟&時間
        public void UpdateProcess(string ID, byte Process)
        {
            Projects data = db.Projects.Find(ID);
            data.Process = Process;
            data.ModifyTime = DateTime.Now;
            db.SaveChanges();
        }

        public void DataSplit(string ID, byte train, byte valid, byte test)
        {
            Projects data = db.Projects.Find(ID);
            data.TrainVal = train;
            data.ValidVal = valid;
            data.TestVal = test;
            db.SaveChanges();
        }

        public void SaveModel(string ID, string model)
        {
            Projects data = db.Projects.Find(ID);
            data.Model = model;
            db.SaveChanges();
        }

        public IQueryable<Model> GetAllModelList(string Id)
        {
            return db.Model.Where(p => p.ProjectId == Id).OrderBy(p=>p.CreateTime);
        }

        public void SaveTraing(Model data)
        {
            var result = db.Model.Where(p => p.ProjectId == data.ProjectId).Where(p=>p.Name == data.Name).ToList();
            //判斷該模型是否已存在
            if (result.Count == 0)
            {
                db.Model.Add(data);
                db.SaveChanges();
            }
            else
            {
                Model Olddata = result[0];
                Olddata.CreateTime = DateTime.Now;
                Olddata.MAE = data.MAE;
                Olddata.MSE = data.MSE;
                Olddata.RMSE = data.RMSE;
                Olddata.MAPE = data.MAPE;
                Olddata.R2 = data.R2;
                db.SaveChanges();
            }
        }

        public Model GetModelData(string ID, string name)
        {
            IQueryable<Model> modelList = GetAllModelList(ID);
            Model result = modelList.Where(p => p.Name == name).First();
            return result;
        }
    }
}