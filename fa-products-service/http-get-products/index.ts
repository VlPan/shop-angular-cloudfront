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
    context.log('GET ALL PRODUCTS');
    const {resources: products} = await  products_container.items.readAll().fetchAll();
    const {resources: products_stocks} = await  products_stocks_container.items.readAll().fetchAll();

    const response = products.map(product => {
        const result: any = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
        }
        const countRecord = products_stocks.find(item => item.product_id === product.id);
        if(countRecord) {
            result.count = countRecord.count;
        } else {
            result.count = 0;
        }

        return result;
    })

    context.res = {
        body: response
    };

};

export default httpTrigger;