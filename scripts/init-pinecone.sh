#!/bin/bash
# Wait for services to be healthy, then ingest sample documents

set -e

echo "Waiting for ai-service to be ready..."
until curl -s http://ai-service:8000/health > /dev/null 2>&1; do
    echo "Waiting for ai-service..."
    sleep 5
done

echo "AI service is healthy, ingesting sample documents..."
python3 /app/scripts/ingest_sample_documents.py

echo "Documents ingested successfully!"