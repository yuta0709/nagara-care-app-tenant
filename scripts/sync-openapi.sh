#!/bin/bash

# スクリプトが存在するディレクトリの絶対パスを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# プロジェクトのルートディレクトリ（スクリプトの親ディレクトリ）
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# api-schemaディレクトリが存在しない場合は作成
mkdir -p "$PROJECT_ROOT/api-schema"

# GitHubのraw contentからopenapi.yamlを取得
curl -o "$PROJECT_ROOT/api-schema/openapi.yaml" \
    "https://raw.githubusercontent.com/yuta0709/nagara-care-api/main/openapi.yaml"

echo "OpenAPI schema has been updated successfully!"
