using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FETrainingModel.Models
{
    [MetadataType(typeof(UserMetadata))]
    public partial class Users
    {
        private class UserMetadata
        {
            public Guid UserId { get; set; }

            [DisplayName("使用者代號")]
            public string UserName { get; set; }

            [DisplayName("使用者密碼")]
            public string Password { get; set; }

            [DisplayName("類別")]
            public string Class { get; set; }

            [DisplayName("廠別")]
            public string Site { get; set; }

        }
    }
}