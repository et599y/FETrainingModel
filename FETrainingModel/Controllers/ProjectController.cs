using FETrainingModel.Models;
using FETrainingModel.Services;
using FETrainingModel.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;

namespace FETrainingModel.Controllers
{
    public class ProjectController : Controller
    {
        private UserService userservice = new UserService();
        private ProjectService projectservice = new ProjectService();
        private ModelService modelservice = new ModelService();
        string filePath = ConfigurationSettings.AppSettings["filePath"] + "ProjectFiles/";

        // GET: Project
        public ActionResult Index()
        {
            //各廠區專案數量
            ViewBag.json = projectservice.AllSiteNum();
            ViewBag.site = projectservice.SiteNum();
            return View();
        }

        # region 登入/登出
        public ActionResult Login()
        {
            //如果通過驗證則進入首頁，否則留在登入頁面
            if (User.Identity.IsAuthenticated)
                return RedirectToAction("ProjectList", "Project");
            return View();
        }
        [HttpPost]
        public ActionResult Login(Users data)
        {
            string ValidateStr = userservice.LoginCheck(data.UserName, data.Password);
            
            if (String.IsNullOrEmpty(ValidateStr))
            {
                //清空session
                HttpContext.Session.Clear();

                FormsAuthenticationTicket ticket = new FormsAuthenticationTicket(1
                    , data.UserName
                    , DateTime.Now
                    , DateTime.Now.AddMinutes(60) //到期時間60分
                    , false
                    , FormsAuthentication.FormsCookiePath);
                string enTicket = FormsAuthentication.Encrypt(ticket); //加密
                Response.Cookies.Add(new HttpCookie(FormsAuthentication.FormsCookieName, enTicket));

                return RedirectToAction("ProjectList", "Project");
            }
            else
            {
                ModelState.AddModelError("", ValidateStr);
                return View();
            }
        }

        [Authorize]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();

            HttpCookie cookiel = new HttpCookie(FormsAuthentication.FormsCookieName, "");
            cookiel.Expires = DateTime.Now.AddYears(-1);
            Response.Cookies.Add(cookiel);

            return RedirectToAction("Login", "Project");
        }
        #endregion

        #region Project CRUD
        // 專案列表
        [Authorize]
        public ActionResult ProjectList(string Search, int Page = 1, bool compare=true)
        {
            ProjectViewModel Data = new ProjectViewModel();
            Data.Search = Search;
            Data.Paging = new Paging(Page);
            Data.ProjectList = projectservice.GetSearchProject(Data.Paging, Data.Search, User.Identity.Name);
            Data.compare = compare;
            return View(Data);
        }

        // 建立專案
        [Authorize]
        public ActionResult CreateProject()
        {
            return View();
        }
        [Authorize]
        [HttpPost]
        public ActionResult CreateProject(ProjectViewModel Insertdata)
        {
            if(Insertdata.Data.Name == null || Insertdata.Data.Goal == null || Insertdata.Data.Purpose == null)
            {
                return View(Insertdata);
            }
            else
            {
                Users user = userservice.FindUser(User.Identity.Name);
                Insertdata.Data.UserId = user.UserId;
                Insertdata.Data.ProjectId = projectservice.GetProjectId(user);
                Insertdata.Data.CreateTime = DateTime.Now;
                Insertdata.Data.ModifyTime = DateTime.Now;
                Insertdata.Data.Process = 0;
                projectservice.AddProject(Insertdata.Data);

                //建立專案資料夾
                string MapPath = filePath + user.Site + "/" + Insertdata.Data.ProjectId;
                string path = MapPath;
                Directory.CreateDirectory(path); 

                return RedirectToAction("ProjectList", "Project");
            }
        }

        // 修改專案內容
        [Authorize]
        public ActionResult EditProject(string ID)
        {
            Projects ProjectData = projectservice.GetProjectData(ID);
            return View(ProjectData);
        }
        [Authorize]
        [HttpPost]
        public ActionResult EditProject(Projects Data)
        {
            if (Data.Name == null || Data.Goal == null || Data.Purpose == null)
            {
                return View(Data);
            }
            else
            {
                projectservice.UpdateProject(Data);
                return RedirectToAction("ProjectList", "Project");
            }
        }

        //刪除專案
        [Authorize]
        public ActionResult DeleteProject(string ID)
        {
            projectservice.DeleteProject(ID); //刪除db project資料
            projectservice.DeleteModel(ID); // 從db清空model

            //刪除Folder資料
            Users user = userservice.FindUser(User.Identity.Name);
            string file = filePath + user.Site + "/" + ID + "/"; //資料夾路徑
            //如果有子檔案刪除檔案
            foreach (string f in Directory.GetFileSystemEntries(file))
            {
                System.IO.File.Delete(f);
            }
            
            //刪除空資料夾
            Directory.Delete(file);

            return RedirectToAction("ProjectList", "Project");
        }
        #endregion
    }
}