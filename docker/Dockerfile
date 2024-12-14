FROM --platform=$BUILDPLATFORM node:20-slim as client-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /home/app
WORKDIR /home/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM --platform=$BUILDPLATFORM swift:6.0.3-noble as server-build
# Cross compilation based on https://swiftinit.org/articles/cross-compiling-x86_64-linux-to-aarch64-linux
RUN apt update && apt -y install gcc-aarch64-linux-gnu g++-multilib
RUN mkdir /home/swift-cross-compile /home/vapor
WORKDIR /home/swift-cross-compile
COPY docker/swift-cross-platform/* /home/swift-cross-compile/

RUN ./download.sh $TARGETPLATFORM && mkdir $TARGETPLATFORM && tar -xzvf swift-$TARGETPLATFORM.tar.gz -C $TARGETPLATFORM

WORKDIR /home/vapor

COPY src /home/vapor/src
COPY Package.swift Package.resolved /home/vapor/
COPY Resources /home/app/Resources
COPY --from=client-build Resources/Views/react.leaf /home/app/Resources/Views/react.leaf

RUN swift build --destination /home/swift-cross-compile/$TARGETPLATFORM.json -c release --static-swift-stdlib 

FROM ubuntu:noble
RUN mkdir /home/app
WORKDIR /home/app

COPY --from=server-build /home/vapor/.build/release/MrScroogeServer /home/app/server
COPY Public /home/app/Public
COPY --from=client-build /home/app/Public/react /home/app/Public/react

EXPOSE 8080
ENTRYPOINT [ "./MrScroogeServer" ]
CMD ["serve", "--env", "production", "--hostname", "0.0.0.0", "--port", "8080"]