#!/usr/bin/env python3
"""Test Elasticsearch configuration and connectivity for NileoPedia."""

import os
import sys
import asyncio

sys.path.insert(0, '/app')

async def test_elasticsearch_config():
    """Test that Elasticsearch configuration is valid and connection works."""
    from app.rag.elasticsearch_service import init_elasticsearch, keyword_search
    
    # Test 1: Configuration validation
    print("=" * 50)
    print("Test 1: Configuration Validation")
    print("=" * 50)
    
    es_url = os.getenv("ELASTICSEARCH_URL")
    es_key = os.getenv("ELASTICSEARCH_API_KEY")
    
    if not es_url:
        print("❌ FAIL: ELASTICSEARCH_URL not set")
        return False
    
    if not es_key:
        print("❌ FAIL: ELASTICSEARCH_API_KEY not set")
        return False
    
    print(f"✓ ELASTICSEARCH_URL set: {es_url[:40]}...")
    print(f"✓ ELASTICSEARCH_API_KEY set: {es_key[:10]}...")
    
    # Test 2: Client initialization
    print("\n" + "=" * 50)
    print("Test 2: Client Initialization")
    print("=" * 50)
    
    try:
        client = init_elasticsearch()
        print("✓ Elasticsearch client initialized")
    except ValueError as e:
        print(f"❌ FAIL: {str(e)}")
        return False
    
    # Test 3: Connectivity test
    print("\n" + "=" * 50)
    print("Test 3: Connectivity Test")
    print("=" * 50)
    
    try:
        # Simple search to validate connection
        results = await keyword_search("diabetes", topK=1)
        print(f"✓ Connected to Elasticsearch successfully")
        print(f"  Found {len(results)} results for test query")
    except Exception as e:
        print(f"❌ FAIL: Connection error - {str(e)}")
        return False
    
    print("\n" + "=" * 50)
    print("All tests passed!")
    print("=" * 50)
    return True

if __name__ == "__main__":
    os.environ["ELASTICSEARCH_URL"] = os.getenv("ELASTICSEARCH_URL", "")
    os.environ["ELASTICSEARCH_API_KEY"] = os.getenv("ELASTICSEARCH_API_KEY", "")
    
    success = asyncio.run(test_elasticsearch_config())
    sys.exit(0 if success else 1)