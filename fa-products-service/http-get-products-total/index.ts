import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
/* eslint-disable */

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

const db = `products-db`;
const products_stock_container_name = `products-stock`;

// Retrieve a configuration key

const cosmosClient = new CosmosClient({ endpoint, key });
const database = cosmosClient.database(db);
const products_stocks_container = database.container(products_stock_container_name);


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        context.log('GET TOTAL PRODUCTS COUNT');
        const {resources: products_stocks} = await products_stocks_container.items.readAll().fetchAll();
    
       
        context.res = {
            body: products_stocks.reduce((acc, cur) => cur.count + acc, 0)
        }
    } catch (err) {
        context.res = {
          status: err.statusCode || 500,
          body: err
        };
      }

};

export default httpTrigger;
