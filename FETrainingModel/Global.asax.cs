using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace FETrainingModel
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

        protected void Application_OnPostAuthenticateRequest(object sender, EventArgs e)
        {
            IPrincipal contextUser = Context.User; //介面

            //取得物件的識別
            if (contextUser.Identity.AuthenticationType == "Forms")
            {
                //取出TICKET
                FormsAuthenticationTicket ticket = ((FormsIdentity)HttpContext.Current.User.Identity).Ticket;
                //將使用者資料取出，並分割成陣列
                string[] roles = ticket.UserData.Split(new char[] { ',' });
                //指派角色到HttpContext的user物件
                HttpContext.Current.User = new GenericPrincipal(User.Identity, roles);
                Thread.CurrentPrincipal = HttpContext.Current.User;
            }
        }
    }
}
