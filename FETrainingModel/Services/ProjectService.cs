using FETrainingModel.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Web;
using static FETrainingModel.Models.Chart;

namespace FETrainingModel.Services
{
    public class ProjectService
    {
        FEModelEntities db = new FEModelEntities();
        UserService userservice = new UserService();

        // 新增專案
        public void AddProject(Projects data)
        {
            db.Projects.Add(data);
            db.SaveChanges();
        }

        // 專案流水號
        public string GetProjectId(Users UserData)
        {
            //get all projects's sites and ProjectId
            List<Users> user = db.Users.ToList();
            List<Projects> project = db.Projects.ToList();
            var result = from p in project
                         join u in user
                         on p.UserId equals u.UserId
                         select new { p.ProjectId, u.Site };

            var P_index = result.Where(m => m.Site == UserData.Site).ToList();
            string index;
            if (P_index.Count == 0)
            {
                index = UserData.Site + "000001";
            }
            else
            {
                string finalID = P_index[P_index.Count - 1].ProjectId;
                int num = Convert.ToInt32(finalID.Substring(UserData.Site.Length));
                index = UserData.Site + (num + 1).ToString("D6"); //固定數字6位數
            }
            return index;
        }

        #region Search

        //搜尋專案|定義分頁資料筆數
        public List<Projects> GetSearchProject(Paging Paging, string Search, string UserName)
        {
            IQueryable<Projects> SearchData;
            Users data = userservice.FindUser(UserName);
            //判斷是否有搜尋資料
            if (string.IsNullOrEmpty(Search))
            {
                //無搜尋資料
                SearchData = GetAllDataList(Paging, data.UserId);
            }
            else
            {
                //有搜尋資料
                SearchData = GetAllDataList(Paging, Search, data.UserId);
            }
            return SearchData.OrderByDescending(p => p.ProjectId).Skip((Paging.NowPage - 1) * (Paging.ItemNum)).Take(Paging.ItemNum).ToList();
        }

        //if無搜尋資料
        public IQueryable<Projects> GetAllDataList(Paging Paging, Guid Id)
        {
            IQueryable<Projects> Data = db.Projects.Where(p => p.UserId == Id);
            Paging.MaxPage = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Data.Count()) / Paging.ItemNum));
            Paging.SetRightPage();

            return Data;
        }

        //if有搜尋資料時
        public IQueryable<Projects> GetAllDataList(Paging Paging, string Search, Guid Id)
        {
            IQueryable<Projects> Data = db.Projects.Where(p => p.UserId == Id).Where(p => p.Name.Contains(Search) || p.ProjectId.Contains(Search));
            Paging.MaxPage = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Data.Count()) / Paging.ItemNum));
            Paging.SetRightPage();

            return Data;
        }
        #endregion

        //取得Project內容
        public Projects GetProjectData(string ID)
        {
            return db.Projects.Find(ID);
        }

        //修改Project
        public void UpdateProject(Projects NewData)
        {
            Projects Data = db.Projects.Find(NewData.ProjectId);
            Data.Name = NewData.Name;
            Data.Goal = NewData.Goal;
            Data.Description = NewData.Description;
            Data.Purpose = NewData.Purpose;
            Data.ModifyTime = DateTime.Now;
            db.SaveChanges();
        }

        //刪除Project
        public void DeleteProject(string ID)
        {
            Projects deletedata = GetProjectData(ID);
            db.Projects.Remove(deletedata);
            db.SaveChanges();

        }

        public List<string> GetAllSites()
        {
            var result = (from p in db.Users
                          select new { p.Site, p.Sort }).Distinct().ToList();
            var result2 = result.OrderBy(i => i.Sort).Select(i => i.Site).ToList();

            return result2;
        }

        public string AllSiteNum()
        {
            //get all projects's sites and Purpose
            List<Users> user = db.Users.ToList();
            List<Projects> project = db.Projects.ToList();
            var result = from p in project
                         join u in user
                         on p.UserId equals u.UserId
                         select new { u.Site, p.Purpose};

            //get all sites
            List<string> sites = GetAllSites();

            var obj = new JArray();
            //User的Site
            foreach (var item in sites)
            {
                List<Chart.SiteData> datas = new List<Chart.SiteData>();
                String[] purpose = { "尋找關鍵因子", "預測迴歸趨勢", "時間序列分析" };

                for (int i = 0; i < purpose.Count(); i++)
                {
                    Chart.SiteData temp = new Chart.SiteData();
                    temp.ClassName = purpose[i];
                    temp.Num = result.Where(p => p.Purpose == purpose[i] && p.Site == item).Count();
                    datas.Add(temp);
                }
                SiteArray ary = new SiteArray();
                ary.Site = item;
                ary.SiteData = datas;
                obj.Add(JObject.FromObject(ary));
            }
            var convertJson = JsonConvert.SerializeObject(obj, Formatting.Indented);
            return convertJson;
        }

        public string SiteNum()
        {
            var obj = new JArray();
            List<string> sites = GetAllSites();

            //get all projects's sites, class and Purpose
            List<Users> user = db.Users.ToList();
            List<Projects> project = db.Projects.ToList();
            var result = from p in project
                         join u in user
                         on p.UserId equals u.UserId
                         select new { u.Site, u.Class };

            foreach (var item in sites)
            {
                List<Chart.SiteData> datas = new List<Chart.SiteData>();
                var a = result.Where(p => p.Site == item).GroupBy(x => x.Class).Select(c => new { Char = c.Key, Count = c.Count() }).ToList();
                if (a.Count() != 0)
                {
                    for (int i = 0; i < a.Count(); i++)
                    {
                        var b = a[i];
                        Chart.SiteData temp = new Chart.SiteData();
                        temp.ClassName = b.Char;
                        temp.Num = b.Count;
                        datas.Add(temp);
                    }
                }
                else
                {
                    //沒有資料填無
                    Chart.SiteData temp = new Chart.SiteData();
                    temp.ClassName = "無";
                    temp.Num = 1;
                    datas.Add(temp);
                }
                SiteArray ary = new SiteArray();
                ary.Site = item;
                ary.SiteData = datas;
                obj.Add(JObject.FromObject(ary));
            }
            var convertJson = JsonConvert.SerializeObject(obj, Formatting.Indented);
            return convertJson;
        }
        public void DeleteModel(string ProjectId)
        {
            var result = db.Model.Where(i => i.ProjectId == ProjectId);
            foreach (var item in result)
            {
                db.Model.Remove(item);
            }
            db.SaveChanges();
        }
    }
}