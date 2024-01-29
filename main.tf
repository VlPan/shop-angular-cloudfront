# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "front_end_rg2" {
    name     = "rg-frontend-sand-ne-97"
    location = "northeurope"
}


resource "azurerm_storage_account" "front_end_storage_account2" {
  name                     = "stgsandfrontendne97"
  location                 = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"
  resource_group_name      = azurerm_resource_group.front_end_rg2.name

  static_website {
    index_document = "index.html"
  }
}


resource "azurerm_resource_group" "product_service_rg2" {
  location = "northeurope"
  name     = "rg-product-service-sand-ne-97"
}


resource "azurerm_storage_account" "products_service_fa2" {
  name     = "stgsangproductsfane98"
  location = "northeurope"

  account_replication_type = "LRS"
  account_tier             = "Standard"
  account_kind             = "StorageV2"

  resource_group_name = azurerm_resource_group.product_service_rg2.name
}


resource "azurerm_storage_share" "products_service_fa2" {
  name  = "fa-products-service-share-2"
  quota = 2

  storage_account_name = azurerm_storage_account.products_service_fa2.name
}

resource "azurerm_service_plan" "product_service_plan2" {
  name     = "asp-product-service-sand-ne-97"
  location = "northeurope"

  os_type  = "Windows"
  sku_name = "Y1"

  resource_group_name = azurerm_resource_group.product_service_rg2.name
}

resource "azurerm_application_insights" "products_service_fa2" {
  name             = "appins-fa-products-service-sand-ne-97"
  application_type = "web"
  location         = "northeurope"


  resource_group_name = azurerm_resource_group.product_service_rg2.name
}


resource "azurerm_windows_function_app" "products_service2" {
  name     = "fa-products-service-ne-98"
  location = "northeurope"

  service_plan_id     = azurerm_service_plan.product_service_plan2.id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

  storage_account_name       = azurerm_storage_account.products_service_fa2.name
  storage_account_access_key = azurerm_storage_account.products_service_fa2.primary_access_key

  functions_extension_version = "~4"
  builtin_logging_enabled     = false

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa2.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa2.connection_string

    # For production systems set this to false
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com", "*"]
    }

    application_stack {
      node_version = "~16"
    }
  }

  app_settings = {
    WEBSITE_CONTENTAZUREFILECONNECTIONSTRING = azurerm_storage_account.products_service_fa2.primary_connection_string
    WEBSITE_CONTENTSHARE                     = azurerm_storage_share.products_service_fa2.name
  }

  # The app settings changes cause downtime on the Function App. e.g. with Azure Function App Slots
  # Therefore it is better to ignore those changes and manage app settings separately off the Terraform.
  lifecycle {
    ignore_changes = [
      app_settings,
      tags["hidden-link: /app-insights-instrumentation-key"],
      tags["hidden-link: /app-insights-resource-id"],
      tags["hidden-link: /app-insights-conn-string"]
    ]
  }
}

resource "azurerm_windows_function_app_slot" "slot-2" {
  name                 = "fa-products-service-ne-98-slot-2"
  function_app_id      = azurerm_windows_function_app.products_service2.id
  storage_account_name       = azurerm_storage_account.products_service_fa2.name

  site_config {
    always_on = false

    application_insights_key               = azurerm_application_insights.products_service_fa2.instrumentation_key
    application_insights_connection_string = azurerm_application_insights.products_service_fa2.connection_string

    # For production systems set this to false
    use_32_bit_worker = true

    # Enable function invocations from Azure Portal.
    cors {
      allowed_origins = ["https://portal.azure.com", "*"]
    }

    application_stack {
      node_version = "~16"
    }
  }
}


resource "azurerm_api_management_api" "products_api2" {
  api_management_name = azurerm_api_management.core_apim2.name
  name                = "products-service-api-2"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  revision            = "1"

  display_name = "Products Service API"

  protocols = ["https"]
}


resource "azurerm_app_configuration" "products_config2" {
  location            = "northeurope"
  name                = "appconfig-products-service-sand-ne-97"
  resource_group_name = azurerm_resource_group.product_service_rg2.name

  sku = "free"
}


resource "azurerm_api_management" "core_apim2" {
  location        = "northeurope"
  name            = "apim-sand-ne-001-97"
  publisher_email = "uladzimir_pantsiukhou@epam.com"
  publisher_name  = "Uladzimir Pantsiukhou"

  resource_group_name = azurerm_resource_group.product_service_rg2.name
  sku_name            = "Consumption_0"
}


data "azurerm_function_app_host_keys" "products_keys2" {
  name = azurerm_windows_function_app.products_service2.name
  resource_group_name = azurerm_resource_group.product_service_rg2.name
}


resource "azurerm_api_management_backend" "products_fa2" {
  name = "products-service-backend2"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  api_management_name = azurerm_api_management.core_apim2.name
  protocol = "http"
  url = "https://${azurerm_windows_function_app.products_service2.name}.azurewebsites.net/api"
  description = "Products API"

  credentials {
    certificate = []
    query = {}

    header = {
      "x-functions-key" = data.azurerm_function_app_host_keys.products_keys2.default_function_key
    }
  }
}

resource "azurerm_api_management_api_policy" "api_policy2" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  resource_group_name = azurerm_resource_group.product_service_rg2.name

  xml_content = <<XML
 <policies>
    <inbound>
        <base/>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
        <allowed-headers>
          <header>*</header>
        </allowed-headers>
      </cors>
    </inbound>
    <backend>
        <base/>
    </backend>
    <outbound>
        <base/>
    </outbound>
    <on-error>
        <base/>
    </on-error>
 </policies>
XML
}

resource "azurerm_api_management_api_operation" "get_products2" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  display_name        = "Get Products"
  method              = "GET"
  operation_id        = "get-products"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation_policy" "get_products2_policy" {
  api_name            = azurerm_api_management_api.products_api2.name
  api_management_name = azurerm_api_management.core_apim2.name
  operation_id        = azurerm_api_management_api_operation.get_products2.operation_id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

    xml_content = <<XML
<policies>
    <inbound>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
        <base/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
      </cors>
    </inbound>
</policies>
XML
}

resource "azurerm_api_management_api_operation" "get_product_by_id" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  display_name        = "Get Product by ID"
  method              = "GET"
  operation_id        = "get-product-by-id"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  url_template        = "/products/{id}"

  template_parameter {
    name     = "id"
    required = true
    type     = "string"
  }
}

resource "azurerm_api_management_api_operation_policy" "get_product_by_id_policy" {
  api_name            = azurerm_api_management_api.products_api2.name
  api_management_name = azurerm_api_management.core_apim2.name
  operation_id        = azurerm_api_management_api_operation.get_product_by_id.operation_id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

    xml_content = <<XML
<policies>
    <inbound>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
        <base/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
      </cors>
    </inbound>
</policies>
XML
}

resource "azurerm_api_management_api_operation" "post_product" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  display_name        = "Post Product"
  method              = "POST"
  operation_id        = "post-product"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  url_template        = "/products"
}

resource "azurerm_api_management_api_operation_policy" "post_product_policy" {
  api_name            = azurerm_api_management_api.products_api2.name
  api_management_name = azurerm_api_management.core_apim2.name
  operation_id        = azurerm_api_management_api_operation.post_product.operation_id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

    xml_content = <<XML
<policies>
    <inbound>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
        <base/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
        <allowed-headers>
          <header>*</header>
        </allowed-headers>
      </cors>
    </inbound>
</policies>
XML
}

resource "azurerm_api_management_api_operation" "get_products-total" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  display_name        = "Get Products total"
  method              = "GET"
  operation_id        = "get-products-total"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  url_template        = "/products-total"
}

resource "azurerm_api_management_api_operation_policy" "get_products-total_policy" {
  api_name            = azurerm_api_management_api.products_api2.name
  api_management_name = azurerm_api_management.core_apim2.name
  operation_id        = azurerm_api_management_api_operation.get_products-total.operation_id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

    xml_content = <<XML
<policies>
    <inbound>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
        <base/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
      </cors>
    </inbound>
</policies>
XML
}


resource "azurerm_api_management_api_operation" "get_data_from_app_config" {
  api_management_name = azurerm_api_management.core_apim2.name
  api_name            = azurerm_api_management_api.products_api2.name
  display_name        = "Get Data From App Config"
  method              = "GET"
  operation_id        = "get-data-from-app-config"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  url_template        = "/get-data-from-app-config"
}

resource "azurerm_api_management_api_operation_policy" "get_data_from_app_config_policy" {
  api_name            = azurerm_api_management_api.products_api2.name
  api_management_name = azurerm_api_management.core_apim2.name
  operation_id        = azurerm_api_management_api_operation.get_data_from_app_config.operation_id
  resource_group_name = azurerm_resource_group.product_service_rg2.name

    xml_content = <<XML
<policies>
    <inbound>
        <set-backend-service backend-id="${azurerm_api_management_backend.products_fa2.name}"/>
        <base/>
      <cors allow-credentials="false">
        <allowed-origins>
          <origin>*</origin>
        </allowed-origins>
        <allowed-methods>
          <method>*</method>
        </allowed-methods>
      </cors>
    </inbound>
</policies>
XML
}

resource "azurerm_cosmosdb_account" "az_cos_acc" {
  location            = "northeurope"
  name                = "cos-app-sand-ne-001-97"
  offer_type          = "Standard"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Eventual"
  }

  capabilities {
    name = "EnableServerless"
  }

  geo_location {
    failover_priority = 0
    location          = "North Europe"
  }
}

resource "azurerm_cosmosdb_sql_database" "az_cos_sql_db" {
  account_name        = azurerm_cosmosdb_account.az_cos_acc.name
  name                = "products-db"
  resource_group_name = azurerm_resource_group.product_service_rg2.name
}

resource "azurerm_cosmosdb_sql_container" "products" {
  account_name        = azurerm_cosmosdb_account.az_cos_acc.name
  database_name       = azurerm_cosmosdb_sql_database.az_cos_sql_db.name
  name                = "products"
  partition_key_path  = "/id"
  resource_group_name = azurerm_resource_group.product_service_rg2.name

  # Cosmos DB supports TTL for the records
  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "products-stock" {
  account_name        = azurerm_cosmosdb_account.az_cos_acc.name
  database_name       = azurerm_cosmosdb_sql_database.az_cos_sql_db.name
  name                = "products-stock"
  partition_key_path  = "/product_id"
  resource_group_name = azurerm_resource_group.product_service_rg2.name

  # Cosmos DB supports TTL for the records
  default_ttl = -1

  indexing_policy {
    excluded_path {
      path = "/*"
    }
  }

  unique_key {
    paths = ["/product_id"]
  }
}