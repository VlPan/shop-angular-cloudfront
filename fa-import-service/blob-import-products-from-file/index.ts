/* eslint-disable */
import { AzureFunction, Context } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { ServiceBusClient } from "@azure/service-bus";

const blobTrigger: AzureFunction = async function (context: Context, myBlob: any): Promise<void> {
    context.log("Blob trigger function processed blob \n Name:", context.bindingData.name, "\n Blob Size:", myBlob.length, "Bytes");
    const blobData = myBlob.toString();
    const linesSplit = blobData.includes("\r\n") ? "\r\n" : "\n";
    const productsStrings = blobData.split(linesSplit);

    context.log('---> productsString', productsStrings)
    const products = productsStrings.map((productsString) => {
      const [title, description, price, count] = productsString.split(";");
      return {
        title: title.trim(),
        description: description.trim(),
        price: Number(price.trim()),
        count: Number(count.trim()),
      };
    });

    const serviceBusConnectionString = process.env.ServiceBusConnectionString;
    context.log("serviceBusConnectionString", serviceBusConnectionString);

    const serviceBusClient = new ServiceBusClient(serviceBusConnectionString);
    const sender = serviceBusClient.createSender('service-bus-topic-sand-ne-97');


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

    try {
      await sender.sendMessages({
        body: JSON.stringify(products)
      });

      const response = await destinationBlob.beginCopyFromURL(sourceBlob.url);
      await response.pollUntilDone();
      await sourceBlob.delete();

     context.res = {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
        body: {},
    };
    } catch (e) {
      context.res = {
        status: 500,
        body: `${e.message}`,
      };
    } finally {
      await sender.close();
      await serviceBusClient.close();
    }
};

export default blobTrigger;