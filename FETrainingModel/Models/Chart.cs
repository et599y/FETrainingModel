using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FETrainingModel.Models
{
    public class Chart
    {
        public class SiteData
        {
            public string ClassName { get; set; }
            public int Num { get; set; }
        }

        public class SiteArray
        {
            public string Site { get; set; }
            public List<SiteData> SiteData { get; set; }
        }
    }
}