
from pinecone import Pinecone
import os

pc = Pinecone(
    api_key=os.getenv("pcsk_3PVC5G_HfJEWoidDYx8AFsLF7NgPonEQFTevy6nwbmEd3iyNH8qUmi6sSevBXf4ynbEH5N")
)

index = pc.Index("nileopedia-medical")