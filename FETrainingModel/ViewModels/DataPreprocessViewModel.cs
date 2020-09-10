using FETrainingModel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FETrainingModel.ViewModels
{
    public class DataPreprocessViewModel
    {
        public string ProjectId { get; set; }
        public string mode { get; set; }
        
        public DataPreprocess pre { get; set; }

        //select
        public List<string> Selected { get; set; }
        public string[] ColList { get; set; }

        //刪除遺失值
        public int drop { get; set; }
        //刪除異常值
        public int abnormal { get; set; }
        //刪除離群值
        public int outlier { get; set; }
        //補值方法
        public string fill { get; set; }

        //資料切割
        public byte TrainVal { get; set; }
        public byte ValidVal { get; set; }
        public byte TestVal { get; set; }
    }
}