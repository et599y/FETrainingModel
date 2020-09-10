using FETrainingModel.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using static FETrainingModel.Models.TrainingModel;

namespace FETrainingModel.ViewModels
{
    public class ModelViewModel
    {
        //無法補值個數
        public string cantfill { get; set; }

        public RF rf { get; set; } //XGB & RF
        public LASSO lasso { get; set; } //LASSO
        public LSTM lstm { get; set; } // LSTM

        //model
        public string model { get; set; }
        public string ProjectId { get; set; }
        public string mode { get; set; }
        public List<Model> ModelList { get; set; }
        public bool preview { get; set; }

        //y欄
        [Required(ErrorMessage = "需選擇欄位")]
        public List<string> Selected { get; set; }
        public string[] ColList { get; set; }

        //激發函數列表
        public string[] activationList { get; set; }
        public string SelectedActivation { get; set; }
    }
}