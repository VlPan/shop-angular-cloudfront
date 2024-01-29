$products = Get-Content '/Users/Uladzimir_Pantsiukhou/Desktop/MS-learn/shop-angular-cloudfront/fa-products-service/mocks/products.mock.json' | Out-String | ConvertFrom-Json
$products_stock = Get-Content '/Users/Uladzimir_Pantsiukhou/Desktop/MS-learn/shop-angular-cloudfront/fa-products-service/mocks/products-stocks.mock.json' | Out-String | ConvertFrom-Json
$cosmosDbContext = New-CosmosDbContext -Account $cosmosDbAccount -Database $databaseName -ResourceGroup $resourceGroupName

foreach($product in $products){
    $document = $product | ConvertTo-Json | Out-String
    New-CosmosDbDocument -Context $cosmosDbContext -CollectionId $collectionName -DocumentBody $document -PartitionKey "id"
}

foreach($product in $products_stock){
    $document = $product | ConvertTo-Json | Out-String
    New-CosmosDbDocument -Context $cosmosDbContext -CollectionId $collectionName -DocumentBody $document -PartitionKey "product_id"
}