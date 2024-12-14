#!/bin/sh
# Download files, from the tarball of the swift page 
# They are a copy paste from https://www.swift.org/install/linux/ubuntu/24_04/#latest
echo "Selecting platform for $1"
if [ $1 == "x64_64" ]; then 
    wget "https://download.swift.org/swift-6.0.3-release/ubuntu2404/swift-6.0.3-RELEASE/swift-6.0.3-RELEASE-ubuntu24.04.tar.gz" -O swift-x86_64.tar.gz
else
    wget "https://download.swift.org/swift-6.0.3-release/ubuntu2404-aarch64/swift-6.0.3-RELEASE/swift-6.0.3-RELEASE-ubuntu24.04-aarch64.tar.gz" -O swift-aarch64.tar.gz
fi