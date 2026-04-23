# TokenAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getANewAccessToken**](TokenAPI.md#getanewaccesstoken) | **POST** /api/v2/token/refresh/ | 
[**obtainNewAccessRefreshTokenPair**](TokenAPI.md#obtainnewaccessrefreshtokenpair) | **POST** /api/v2/token/new/ | 


# **getANewAccessToken**
```swift
    open class func getANewAccessToken(jWTRefreshRequest: JWTRefreshRequest, completion: @escaping (_ data: SpectacularJWTRefresh?, _ error: Error?) -> Void)
```



Refresh access token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let jWTRefreshRequest = JWTRefreshRequest(refresh: "refresh_example") // JWTRefreshRequest | 

TokenAPI.getANewAccessToken(jWTRefreshRequest: jWTRefreshRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jWTRefreshRequest** | [**JWTRefreshRequest**](JWTRefreshRequest.md) |  | 

### Return type

[**SpectacularJWTRefresh**](SpectacularJWTRefresh.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obtainNewAccessRefreshTokenPair**
```swift
    open class func obtainNewAccessRefreshTokenPair(jWTObtainPairRequest: JWTObtainPairRequest, completion: @escaping (_ data: SpectacularJWTObtain?, _ error: Error?) -> Void)
```



Obtain JWT pair

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import OpenAPIClient

let jWTObtainPairRequest = JWTObtainPairRequest(secretId: "secretId_example", secretKey: "secretKey_example") // JWTObtainPairRequest | 

TokenAPI.obtainNewAccessRefreshTokenPair(jWTObtainPairRequest: jWTObtainPairRequest) { (response, error) in
    guard error == nil else {
        print(error)
        return
    }

    if (response) {
        dump(response)
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jWTObtainPairRequest** | [**JWTObtainPairRequest**](JWTObtainPairRequest.md) |  | 

### Return type

[**SpectacularJWTObtain**](SpectacularJWTObtain.md)

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

