using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace VSTSInspector
{
    class Program
    {
        static void Main(string[] args)
        {
            foreach(var folder in Directory.GetDirectories(@"D:\Downloads\drop\drop\").Where(d=>d.EndsWith("Api")))
            {
                string apiName = folder.Split('\\').Last().Replace(".Api", "").Replace("Casa.", "").Replace("Api","");
                string fileName = Path.Combine(folder, @"bin\Release\net472", "Casa." + apiName + ".Api.exe");

                var operations = GetOperations(Assembly.LoadFrom(fileName));
                if (operations != null)
                {
                    foreach (var operation in operations)
                    {
                        Console.WriteLine(apiName + "  -  " + operation);
                    }
                }
            }
        }

        static IEnumerable<string> GetOperations(Assembly assembly)
        {
            try
            {
                return assembly.DefinedTypes
                    .Where(t => t.BaseType != null && t.BaseType.Name == "ActionHandlerFunction`2")
                    .Select(t => t.Name.Replace("ActionHandler", ""));
            }
            catch(ReflectionTypeLoadException ex)
            {
                return ex.Types  // contains the types it managed to load, so good enough?
                    .Where(z => z!=null && z.BaseType != null && z.BaseType.Name == "ActionHandlerFunction`2")
                    .Select(y => y.Name.Replace("ActionHandler", ""));
            }
        }
    }
}
