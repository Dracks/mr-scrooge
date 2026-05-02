Pod::Spec.new do |s|
  s.name = 'GoCardlessClient'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'
  s.version = '2.0 (v2)'
  s.source = { :git => 'git@github.com:OpenAPITools/openapi-generator.git', :tag => 'v2.0 (v2)' }
  s.authors = 'OpenAPI Generator'
  s.license = 'Proprietary'
  s.homepage = 'https://github.com/OpenAPITools/openapi-generator'
  s.summary = 'GoCardlessClient Swift SDK'
  s.source_files = 'Sources/GoCardlessClient/**/*.swift'
end
