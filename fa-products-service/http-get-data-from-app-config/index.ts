import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AppConfigurationClient } from '@azure/app-configuration';
/* eslint-disable */

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
   
    const connection_string = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;
    const client = new AppConfigurationClient(connection_string);
    const configs = await client.getConfigurationSetting({ key: 'DATA_FROM_APP_CONFIG' });

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: configs.value
    };

};

export default httpTrigger;
