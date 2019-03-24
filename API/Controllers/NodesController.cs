using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Helpers;
using System.Web.Http;
using System.Web.Http.Cors;
using VIznegration.Models;

namespace VIznegration.Controllers
{
    //[EnableCors(origins: "*", headers: "*", methods: "*")]
    public class NodesController : ApiController
    {
        public string Get()
        {

            var file = System.IO.File.ReadAllText(@"C:\Users\Lee\Source\Repos\VIznegration\VIznegration\casa.json");
            var json = System.Web.Helpers.Json.Decode(file);
            //var nodes = new Node[2];
            //nodes[0] = new Node()
            //{
            //    Key = "1",
            //    Description = "testing",
            //    Category = "Operation",
            //    Name = "test1"
            //};

            //nodes[1] = new Node()
            //{
            //    Key = "2",
            //    Description = "testing 2",
            //    Category = "Operation",
            //    Name = "test2"
            //};

            return "xx";
        }

        // GET api/values/5
        public string Get(string project)
        {
            return "ok";
            //var blob = new BlobManager(project.ToString());
            //return blob.BlobList().ToArray();
        }



        // POST api/values
        [HttpPost]
        public void Post([FromBody]object value)
        {
            //var jsonString = System.Web.Helpers.Json.Encode(value);
            var fileName = DateTime.Now.ToString().Replace(" ", "");
            fileName = fileName.Replace("/", "");
            fileName = fileName.Replace(":", "");
            //System.IO.File.WriteAllText(@"C:\Users\Lee\Source\Repos\VIznegration\VIznegration\" + fileName + ".json", value.ToString());
            var blob = new BlobManager("casa");
            blob.UploadFile(fileName, value.ToString());
        }

        //// PUT api/values/5
        //public void Put(int id, [FromBody]string value)
        //{
        //}

        //// DELETE api/values/5
        //public void Delete(int id)
        //{
        //}
    }
}
