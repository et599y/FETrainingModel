using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FETrainingModel.Models
{
    public class DataPreprocess
    {
        //缺失值
        public string isnull { get; set; }

        //刪除的欄位
        public string[] DeleteCol { get; set; }

        //一樣的欄位
        public string[] SameCol { get; set; }

        //異常值
        public string abnormal { get; set; }

        //離群值
        public string outlier { get; set; }

        //無法補值
        public string cantfill { get; set; }

        //EDA

        //原資料總數
        public string col1 { get; set; }
        //處理後筆數
        public string col2 { get; set; }
        //重複欄位數
        public string col3 { get; set; }
        //刪除總筆數
        public string col4 { get; set; }
        //補值總補筆數
        public string col5 { get; set; }
        //欄位數
        public string col6 { get; set; }
    }
}