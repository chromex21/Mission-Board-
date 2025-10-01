#!/usr/bin/env bash
TAG_NAME=${1:-backup/main-$(date +%Y%m%d_%H%M%S)}
echo "Creating annotated tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Backup before history rewrite: $TAG_NAME"
echo "Pushing tag to origin..."
git push origin "$TAG_NAME"
echo "Tag $TAG_NAME created and pushed."
