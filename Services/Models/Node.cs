using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VIznegration.Models
{
    public class Node
    {
        public string Key { get; set; }
        public string Name { get; set; }
        public string Group { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }

    public class Link
    {
        public string Key { get; set; }
        public string Name { get; set; }
        public string Group { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }
}