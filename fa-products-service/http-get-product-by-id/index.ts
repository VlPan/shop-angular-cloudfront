import {CosmosClient} from '@azure/cosmos';
import { AzureFunction, Context, HttpRequest } from "@azure/functions"
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


const products = [
    {
        id: '1',
        name: '1',
        price: '2'
    },
    {
        id: '2',
        name: '3',
        price: '4'
    }
]

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const id = context.req.params.id;
    context.log('GET PRODUCT BY ID', id);

    let {resource: product} = await products_container.item(id, id).read();
    let {resources: count} = await products_stocks_container.items.query(`SELECT * FROM c WHERE c.product_id="${id}"`).fetchAll();
    count = count[0].count;

    context.log('GET PRODUCT BY ID-- count', count);

    if (!product) {
        throw ({ statusCode: 404, message: `No product with ${id} found` });
    }

    product = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
    }

    if(!count) {
        product.count = 0;
    } else {
        product.count = count;
    }


    context.res = {
        body: product
    };

};

export default httpTrigger;

