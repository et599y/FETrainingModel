using FETrainingModel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FETrainingModel.ViewModels
{
    public class PredictViewModel
    {
        public string ProjectId { get; set; }

        public List<Model> ModelList { get; set; }

        public string ModelName { get; set; }

        public string Selected { get; set; }
    }
}