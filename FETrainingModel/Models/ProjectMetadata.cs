using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FETrainingModel.Models
{
    [MetadataType(typeof(ProjectMetadata))]
    public partial class Projects
    {
        private class ProjectMetadata
        {
            public Guid UserId { get; set; }

            [DisplayName("專案代碼")]
            public int ProjectId { get; set; }

            [DisplayName("專案名稱")]
            [Required(ErrorMessage = "必填")]
            public string Name { get; set; }

            [DisplayName("專案目標")]
            [Required(ErrorMessage = "必填")]
            public string Goal { get; set; }

            [DisplayName("專案描述")]
            [MaxLength(200)]
            public string Description { get; set; }

            [DisplayName("使用目的")]
            [Required(ErrorMessage = "必填")]
            [MaxLength(100)]
            public string Purpose { get; set; }

            [DisplayName("建立時間")]
            public DateTime CreateTime { get; set; }

            [DisplayName("修改時間")]
            public DateTime ModifyTime { get; set; }

            [DisplayName("進度")]
            public byte Process { get; set; }

            [DisplayName("訓練比例")]
            public byte TrainVal { get; set; }

            [DisplayName("驗證比例")]
            public byte ValidVal { get; set; }

            [DisplayName("測試比例")]
            public byte TestVal { get; set; }

            [DisplayName("模型")]
            public string Model { get; set; }
        }
    }
    
}