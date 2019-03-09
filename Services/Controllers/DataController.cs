using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace VIznegration.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class DataController : ApiController
    {
        public string[] Get(string project)
        {
            var blob = new BlobManager(project.ToString());
            return blob.BlobList().OrderByDescending(x=>x).ToArray();
        }

        public string Get(string project, string id)
        {
            var blob = new BlobManager(project);
            if(id.ToUpper() == "LATEST")
            {
                var list = Get(project);
                return blob.GetBlob(list[0]);
            }
            return blob.GetBlob(id);
        }

        // POST api/values
        [HttpPost]
        public void Post(string project, [FromBody]object value)
        {
            var id = DateTime.Now.ToString("yyMMddHHmmss").Replace(" ", "");
            id = id.Replace("/", "");
            id = id.Replace(":", "");

            var blob = new BlobManager(project);
            blob.UploadFile(id, value.ToString());
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
