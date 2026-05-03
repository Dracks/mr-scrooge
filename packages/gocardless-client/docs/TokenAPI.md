# TokenAPI

All URIs are relative to *https://bankaccountdata.gocardless.com*

Method | HTTP request | Description
------------- | ------------- | -------------
[**getANewAccessToken**](TokenAPI.md#getanewaccesstoken) | **POST** /api/v2/token/refresh/ | 
[**obtainNewAccessRefreshTokenPair**](TokenAPI.md#obtainnewaccessrefreshtokenpair) | **POST** /api/v2/token/new/ | 


# **getANewAccessToken**
```swift
    open class func getANewAccessToken(jWTRefreshRequest: JWTRefreshRequest, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<GetANewAccessToken>
```



Refresh access token

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let jWTRefreshRequest = JWTRefreshRequest(refresh: "refresh_example") // JWTRefreshRequest | 

TokenAPI.getANewAccessToken(jWTRefreshRequest: jWTRefreshRequest).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jWTRefreshRequest** | [**JWTRefreshRequest**](JWTRefreshRequest.md) |  | 

### Return type

#### GetANewAccessToken

```swift
public enum GetANewAccessToken {
    case http200(value: SpectacularJWTRefresh?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: SpectacularJWTRefresh?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **obtainNewAccessRefreshTokenPair**
```swift
    open class func obtainNewAccessRefreshTokenPair(jWTObtainPairRequest: JWTObtainPairRequest, headers: HTTPHeaders = GoCardlessClientAPIConfiguration.shared.customHeaders, beforeSend: (inout ClientRequest) throws -> () = { _ in }) -> EventLoopFuture<ObtainNewAccessRefreshTokenPair>
```



Obtain JWT pair

### Example
```swift
// The following code samples are still beta. For any issue, please report via http://github.com/OpenAPITools/openapi-generator/issues/new
import GoCardlessClient

let jWTObtainPairRequest = JWTObtainPairRequest(secretId: "secretId_example", secretKey: "secretKey_example") // JWTObtainPairRequest | 

TokenAPI.obtainNewAccessRefreshTokenPair(jWTObtainPairRequest: jWTObtainPairRequest).whenComplete { result in
    switch result {
    case .failure(let error):
    // process error
    case .success(let response):
        switch response {
        // process decoded response value or raw ClientResponse
        case .http200(let value, let raw):
        case .http401(let value, let raw):
        case .http403(let value, let raw):
        case .http429(let value, let raw):
        case .http0(let value, let raw):
        }
    }
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **jWTObtainPairRequest** | [**JWTObtainPairRequest**](JWTObtainPairRequest.md) |  | 

### Return type

#### ObtainNewAccessRefreshTokenPair

```swift
public enum ObtainNewAccessRefreshTokenPair {
    case http200(value: SpectacularJWTObtain?, raw: ClientResponse)
    case http401(value: ModelErrorResponse?, raw: ClientResponse)
    case http403(value: ModelErrorResponse?, raw: ClientResponse)
    case http429(value: ModelErrorResponse?, raw: ClientResponse)
    case http0(value: SpectacularJWTObtain?, raw: ClientResponse)
}
```

### Authorization

[jwtAuth](../README.md#jwtAuth)

### HTTP request headers

 - **Content-Type**: application/json, application/x-www-form-urlencoded, multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

