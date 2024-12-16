FROM --platform=$BUILDPLATFORM node:22-slim AS client-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY src /home/app/src
COPY package.yaml /home/app
COPY config /home/app/config
COPY pnpm-lock.yaml /home/app
COPY tsconfig.json /home/app
WORKDIR /home/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npx pnpm run build:view
RUN ls Resources
RUN ls Resources/Views


FROM --platform=$BUILDPLATFORM swift:6.0.3-noble AS server-build

# Cross compilation based on https://swiftinit.org/articles/cross-compiling-x86_64-linux-to-aarch64-linux
RUN apt update && apt -y install gcc-aarch64-linux-gnu wget2 && apt -y install g++-multilib
RUN mkdir /home/swift-cross-compile /home/vapor
WORKDIR /home/swift-cross-compile
COPY docker/swift-cross-platform/* /home/swift-cross-compile/

RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get install -y libjemalloc-dev

ARG TARGETARCH
RUN ./download.sh "$TARGETARCH" && mkdir "$TARGETARCH" && tar -xzvf swift-$TARGETARCH.tar.gz -C $TARGETARCH

WORKDIR /build

COPY Package.* ./
RUN swift package resolve \
        $([ -f ./Package.resolved ] && echo "--force-resolved-versions" || true)

COPY src src
COPY --from=client-build /home/app/Resources/Views/react.leaf /home/vapor/Resources/Views/react.leaf

RUN swift build --destination /home/swift-cross-compile/$TARGETARCH.json -c release --static-swift-stdlib 

FROM ubuntu:noble
RUN mkdir /home/app
WORKDIR /home/app

COPY --from=server-build /build/.build/release/MrScroogeServer /home/app/server
COPY Public /home/app/Public
COPY --from=client-build /home/app/Public/react /home/app/Public/react

EXPOSE 8080
ENTRYPOINT [ "./server" ]
CMD ["serve", "--env", "production", "--hostname", "0.0.0.0", "--port", "8080"]