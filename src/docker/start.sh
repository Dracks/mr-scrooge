#!/bin/sh
set -e

SERVER="./server"

# Validate command-line arguments
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Error: Missing required arguments"
    echo "Usage: $0 <hostname> <port>"
    exit 1
fi

echo "Migrating DB to the last version"
$SERVER migrate -y


if [ ! -f ".mr-scrooge-init" ] && [ "$DEMO" = "true" ]; then
    echo "Creating user"
    COMMAND="$SERVER create_user --if-not-exists --admin"
    if [ ! -z "$DEMO_USER" ]; then
        COMMAND="$COMMAND -u $DEMO_USER"
    fi

    if [ ! -z "$DEMO_PWD" ]; then
        COMMAND="$COMMAND -p $DEMO_PWD"
    fi

    if [ ! -z "$DEMO_EMAIL" ]; then
        COMMAND="$COMMAND -e $DEMO_EMAIL"
    fi

    OUTPUT=$($COMMAND)
    GROUP_ID=$(echo "$OUTPUT" | grep "groupId: " | sed 's/.*groupId: //')

    if [ "$DEMO_DATA" = "true" ]; then
        if [ ! -z "$GROUP_ID" ]; then
            echo "Generating demo data for group '$GROUP_ID'"
            $SERVER demo_data -g $GROUP_ID
        else
            echo "No demo data generated as groupID not found"
        fi
    fi

    touch .mr-scrooge-init
fi

echo "Starting server"
$SERVER serve --hostname $1 --port $2