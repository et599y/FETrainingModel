using FETrainingModel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;

namespace FETrainingModel.Services
{
    public class UserService
    {
        FEModelEntities db = new FEModelEntities();

        // 用USERNAME GET USERID
        public Users FindUser(string UserName)
        {
            var result = from s in db.Users where s.UserName == UserName select s;
            Users User = new Users();
            foreach (var item in result)
            {
                User = db.Users.Find(item.UserId);
            }
            return User;
        }

        //登入確認
        public string LoginCheck(string UserName, string Password)
        {
            Users data = FindUser(UserName);

            //判斷是否有此使用者
            if (data.UserName != null)
            {
                if (PasswordCheck(data, Password)) //檢查密碼
                {
                    return null;
                }
                else
                {
                    return "密碼輸入錯誤";
                }
            }
            else
            {
                return "查無此使用者";
            }
        }

        //檢查密碼
        private bool PasswordCheck(Users User, string Password)
        {
            bool result = User.Password.Equals(Password);
            return result;
        }
    }
}