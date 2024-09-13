COMMAND="swift run"
if [ $# -gt 1 ]; then
    COMMAND="swift $*"
fi

echo "Executing $COMMAND"
find app app-tests Package.swift -name "*.swift" | entr -r -s "$COMMAND"
