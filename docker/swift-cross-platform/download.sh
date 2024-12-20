#!/bin/sh

set -e
if [ $# -ne 1 ]; then
    echo "Usage: $0 <architecture>" >&2
    echo "Supported architectures: amd64, aarch64" >&2
    exit 1
fi

SWIFT_VERSION="6.0.3"
BASE_URL="https://download.swift.org/swift-${SWIFT_VERSION}-release/ubuntu2404"

# Download files, from the tarball of the swift page 
# They are a copy paste from https://www.swift.org/install/linux/ubuntu/24_04/#latest
echo "Selecting platform for $1"
if [ "$1" = "amd64" ]; then 
    ARCH=""
    OUTPUT="swift-amd64.tar.gz"
elif [ "$1" = "aarch64" ]; then
    ARCH="-aarch64"
    OUTPUT="swift-aarch64.tar.gz"
else 
    echo "Unsuported architecture $1"
    exit 2
fi


URL="${BASE_URL}${ARCH}/swift-${SWIFT_VERSION}-RELEASE/swift-${SWIFT_VERSION}-RELEASE-ubuntu24.04${ARCH}.tar.gz"

# Download with retry and progress
wget2 --tries=3 --retry-connrefused --progress=bar:force:noscroll "$URL" -O "$OUTPUT"

# Download and verify checksum
# wget2 --tries=3 "$URL.sig" -O "$OUTPUT.sig"
# if ! gpg --verify "$OUTPUT.sig" "$OUTPUT"; then
#     echo "Checksum verification failed!" >&2
#    rm -f "$OUTPUT" "$OUTPUT.sig"
#    exit 1
#fi