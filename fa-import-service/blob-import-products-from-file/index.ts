/* eslint-disable */
import { AzureFunction, Context } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";

const blobTrigger: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {
    context.log("Blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
    const csvString = myBlob.toString();

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );
    const sourceContainer = blobServiceClient.getContainerClient(
      'upload-container'
    );
    const destinationContainer = blobServiceClient.getContainerClient(
      'parsed'
    );

    const sourceBlob = sourceContainer.getBlockBlobClient(
      context.bindingData.name
    );
    const destinationBlob = destinationContainer.getBlockBlobClient(
      sourceBlob.name
    );

    const response = await destinationBlob.beginCopyFromURL(sourceBlob.url);
    await response.pollUntilDone();
    await sourceBlob.delete();
};

export default blobTrigger;
