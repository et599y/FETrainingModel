//------------------------------------------------------------------------------
// <auto-generated>
//    這個程式碼是由範本產生。
//
//    對這個檔案進行手動變更可能導致您的應用程式產生未預期的行為。
//    如果重新產生程式碼，將會覆寫對這個檔案的手動變更。
// </auto-generated>
//------------------------------------------------------------------------------

namespace FETrainingModel.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Model
    {
        public string ProjectId { get; set; }
        public string Name { get; set; }
        public Nullable<double> MAE { get; set; }
        public Nullable<double> MSE { get; set; }
        public Nullable<double> RMSE { get; set; }
        public Nullable<double> MAPE { get; set; }
        public Nullable<double> R2 { get; set; }
        public Nullable<System.DateTime> CreateTime { get; set; }
        public string y { get; set; }
    }
}
