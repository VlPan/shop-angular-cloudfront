/* eslint-disable */

import {
  BlobSASPermissions,
  BlobServiceClient,
  SASProtocol,
} from "@azure/storage-blob";
import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const getSas = async (
  serviceName: string,
  serviceKey: string,
  containerName: string,
  fileName: string,
  permissions,
  timerange
): Promise<string> => {
  if (!serviceName || !serviceKey || !fileName || !containerName) {
    return "Generate SAS function missing parameters";
  }
  
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AzureWebJobsStorage
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  const SIXTY_MINUTES = timerange * 60 * 1000;
  const NOW = new Date();

  const sasToken = await blockBlobClient.generateSasUrl({
    startsOn: NOW,
    expiresOn: new Date(new Date().valueOf() + SIXTY_MINUTES),
    permissions: BlobSASPermissions.parse(permissions),
    protocol: SASProtocol.Https,
  });

  return sasToken;
};




const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('TEST')
     context.log(`process.env?.Azure_Storage_AccountName: ${process.env?.Azure_Storage_AccountName}`);
    context.log(`process.env?.Azure_Storage_AccountKey,: ${process.env?.Azure_Storage_AccountKey}`);
    const fileName = req.query["name"] || "undefined_name";

    context.log(`fileName: ${fileName}`);

  const sasToken = await getSas(
    process.env?.Azure_Storage_AccountName,
    process.env?.Azure_Storage_AccountKey,
    "upload-container",
    fileName,
    "w",
    10
  );

  context.res = {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Private-Network": true },
    body: JSON.stringify({ sasToken }),
  };

};

export default httpTrigger;
