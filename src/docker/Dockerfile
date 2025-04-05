FROM --platform=$BUILDPLATFORM node:22-slim AS client-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest && corepack enable

COPY src /home/app/src
COPY package.yaml /home/app
COPY config /home/app/config
COPY pnpm-lock.yaml /home/app
COPY tsconfig.json /home/app
WORKDIR /home/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN npx pnpm run build:view


FROM swift:6.0.3-noble AS server-build

ARG VERSION
ARG GIT_COMMIT

RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get install -y libjemalloc-dev


WORKDIR /build

COPY Package.* ./
RUN swift package resolve \
        $([ -f ./Package.resolved ] && echo "--force-resolved-versions" || true)

COPY src src
COPY --from=client-build /home/app/Resources/Views/react.leaf /home/vapor/Resources/Views/react.leaf
RUN echo "struct BuildInfo { static let appVersion = \"$VERSION\"; static let commit = \"$GIT_COMMIT\" }" > src/swift-server/version.swift

RUN swift build -c release --static-swift-stdlib

FROM ubuntu:noble

# Make sure all system packages are up to date, and install only essential packages.
RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get -q install -y \
      libjemalloc2 \
      ca-certificates \
      tzdata \
# If your app or its dependencies import FoundationNetworking, also install `libcurl4`.
      libcurl4 \
# If your app or its dependencies import FoundationXML, also install `libxml2`.
      # libxml2 \
    && rm -r /var/lib/apt/lists/*

# Create a vapor user and group with /app as its home directory
RUN useradd --user-group --create-home --system --skel /dev/null --home-dir /home/app vapor
WORKDIR /home/app

COPY src/docker/start.sh /home/app/
RUN chmod +x /home/app/start.sh
COPY --chown=vapor:vapor --from=server-build /build/.build/release/MrScroogeServer /home/app/server
COPY --chown=vapor:vapor Public /home/app/Public
COPY --chown=vapor:vapor --from=client-build /home/app/Public/react /home/app/Public/react
COPY --chown=vapor:vapor Resources /home/app/Resources
RUN mkdir -p /home/app/Resources/Views/
COPY --chown=vapor:vapor --from=client-build /home/app/Resources/Views/react.leaf /home/app/Resources/Views/

# Provide configuration needed by the built-in crash reporter and some sensible default behaviors.
ENV SWIFT_BACKTRACE=enable=yes,sanitize=yes,threads=all,images=all,interactive=no,swift-backtrace=./swift-backtrace-static
ENV ENVIRONMENT=docker

# Ensure all further commands run as the vapor user
USER vapor:vapor

EXPOSE 8080
CMD ["./start.sh", "0.0.0.0", "8080"]