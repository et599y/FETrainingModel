using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FETrainingModel.Models
{
    public class TrainingModel
    {
        public class RF
        {
            public int n_estimators { get; set; }
            public int max_depth { get; set; }
        }

        public class LASSO
        {
            public float alpha { get; set; }
            public int max_iter { get; set; }
        }

        public class LSTM
        {
            public int trainging { get; set; }
            public int predict { get; set; }
            public int epoch { get; set; }
            public int units { get; set; }
            public float dropout { get; set; }
            public string model { get; set; }
        }
    }
}