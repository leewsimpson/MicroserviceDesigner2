using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VIznegration.Controllers
{
    public class BlobManager
    {
        private CloudBlobContainer blobContainer;

        public BlobManager(string ContainerName)
        {
            // Check if Container Name is null or empty  
            if (string.IsNullOrEmpty(ContainerName))
            {
                throw new ArgumentNullException("ContainerName", "Container Name can't be empty");
            }
            try
            {
                string ConnectionString = "DefaultEndpointsProtocol=https;AccountName=viznigration;AccountKey=kf7HbY6V+Iu3gNhEKsnBmlEzcm97SD8sarzEed19RY6NNGTrteHsXwORjxtjPMOpBwCCm47uwkUH4KOU8+IAWA==;EndpointSuffix=core.windows.net";
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(ConnectionString);
                CloudBlobClient cloudBlobClient = storageAccount.CreateCloudBlobClient();
                blobContainer = cloudBlobClient.GetContainerReference(ContainerName);

                // Create the container and set the permission  
                if (blobContainer.CreateIfNotExists())
                {
                    blobContainer.SetPermissions(
                        new BlobContainerPermissions
                        {                            
                            PublicAccess = BlobContainerPublicAccessType.Blob
                        }
                    );
                }
            }
            catch (Exception ExceptionObj)
            {
                throw ExceptionObj;
            }
        }

        public string UploadFile(string name, string data)
        {
            CloudBlockBlob blockBlob;
            blockBlob = blobContainer.GetBlockBlobReference(name);
            //blockBlob.Properties.ContentType = 
            blockBlob.UploadText(data);

            return blockBlob.Uri.AbsoluteUri;
        }

        public List<string> BlobList()
        {
            var blobList = new List<string>();
            foreach (var item in blobContainer.ListBlobs())
            {
                if (item.GetType() == typeof(CloudBlockBlob))
                {
                    var blobpage = (CloudBlockBlob)item;
                    blobList.Add(blobpage.Name);
                }
            }
            return blobList;
        }

        public string GetBlob(string name)
        {
            var blockBlob = blobContainer.GetBlockBlobReference(name);
            return blockBlob.DownloadText();
        }

        public bool DeleteBlob(string BlobName)
        {
            try
            {
                CloudBlockBlob blockBlob = blobContainer.GetBlockBlobReference(BlobName);

                blockBlob.Delete();
                return true;
            }
            catch (Exception ExceptionObj)
            {
                throw ExceptionObj;
            }
        }
    }
}