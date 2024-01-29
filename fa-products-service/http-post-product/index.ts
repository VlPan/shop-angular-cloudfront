import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";
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


const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    context.log('POST PRODUCT');

    const body = {
      ...context.req.body,
    }

    if (!isValidBody(body)) {
      throw ({ statusCode: 400, message: 'Product body is invalid' });
    }

    const productBody = {
      title: body.title,
      price: body.price,
      description: body.description,
    }

      let {resource: product} = await products_container.items.upsert(productBody);
      let stockToSave: any = {product_id: product.id, count: body.count || 1};
      await products_stocks_container.items.upsert(stockToSave);

      context.log('POST PRODUCT RESULTS, ', product, stockToSave);

      context.res = {
        body: product
      };
    } catch (err) {
      context.res = {
        status: err.statusCode || 500,
        body: err
      };
    }
};

function isValidBody(body) {
  const requiredFields = ["title", "price"];
  return  requiredFields.every(key => Object.keys(body).includes(key));
}

export default httpTrigger;

