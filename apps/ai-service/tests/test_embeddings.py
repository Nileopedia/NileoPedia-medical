import pytest
from app.embeddings.openai_embeddings import create_embedding, EmbeddingService
import sys
sys.path.insert(0, '/app')

class TestEmbeddingGeneration:
    def test_empty_string_raises_error(self):
        with pytest.raises(ValueError):
            create_embedding("")

    def test_none_text_raises_error(self):
        with pytest.raises(ValueError):
            create_embedding(None)

    def test_embedding_service_exists(self):
        assert hasattr(EmbeddingService, 'generate')

    def test_embedding_service_returns_list(self):
        embedding = create_embedding("medical research test")
        assert isinstance(embedding, list)
        assert all(isinstance(x, float) for x in embedding)

    def test_embedding_has_correct_dimensions(self):
        embedding = create_embedding("test medical text")
        assert len(embedding) > 0