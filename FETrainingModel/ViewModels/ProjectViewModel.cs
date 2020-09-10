using FETrainingModel.Models;
using FETrainingModel.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace FETrainingModel.ViewModels
{
    public class ProjectViewModel
    {
        public List<Projects> ProjectList { get; set; }

        public Paging Paging { get; set; }

        [DisplayName("搜尋")]
        public string Search { get; set; }

        public Projects Data { get; set; }

        public bool compare { get; set; }

    }
}