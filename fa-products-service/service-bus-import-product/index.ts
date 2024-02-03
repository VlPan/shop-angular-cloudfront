import {CosmosClient} from '@azure/cosmos';
import { AzureFunction, Context } from "@azure/functions"
/* eslint-disable */

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

const db = `products-db`;
const products_container_name = `products`;
const products_stock_container_name = `products-stock`;

// Retrieve a configuration key

const cosmosClient = new CosmosClient({ endpoint, key });
const database = cosmosClient.database(db);
const products_container = database.container(products_container_name);
const products_stocks_container = database.container(products_stock_container_name);

const httpTrigger: AzureFunction = async function ( context: Context,serviceBusItem: string): Promise<void> {
  context.log('Service bus triggered');

  const products: any[] = JSON.parse(serviceBusItem);

  context.res = {
    status: 200,
  };

  for (const item of products) {
    const productBody = {
      title: item.title,
      price: item.price,
      description: item.description,
    }

    let {resource: product} = await products_container.items.upsert(productBody);
    let stockToSave: any = {product_id: product.id, count: product.count || 1};

    await products_stocks_container.items.upsert(stockToSave);

    context.res = {
      status: 200,
    };
  }

};


export default httpTrigger;