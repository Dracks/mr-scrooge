#!/bin/sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <architecture>" >&2
    echo "Supported architectures: x86_64, aarch64" >&2
    exit 1
fi

# Download files, from the tarball of the swift page 
# They are a copy paste from https://www.swift.org/install/linux/ubuntu/24_04/#latest
echo "Selecting platform for $1"
if [ "$1" = "amd64" ]; then 
    wget2 "https://download.swift.org/swift-6.0.3-release/ubuntu2404/swift-6.0.3-RELEASE/swift-6.0.3-RELEASE-ubuntu24.04.tar.gz" -O swift-amd64.tar.gz
elif [ "$1" = "aarch64" ]; then
    wget2 "https://download.swift.org/swift-6.0.3-release/ubuntu2404-aarch64/swift-6.0.3-RELEASE/swift-6.0.3-RELEASE-ubuntu24.04-aarch64.tar.gz" -O swift-aarch64.tar.gz
else 
    echo "Unsuported architecture $1"
    exit 2
fi