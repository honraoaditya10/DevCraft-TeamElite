"""MongoDB connection and database initialization."""

import os
from typing import Optional
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ServerSelectionTimeoutError


class MongoDBConnector:
    """MongoDB connection manager."""

    _instance: Optional["MongoDBConnector"] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    def __new__(cls) -> "MongoDBConnector":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._connect()

    def _connect(self):
        """Initialize MongoDB connection."""
        mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB", "docu_agent")

        try:
            self._client = MongoClient(mongo_url, connectTimeoutMS=5000, serverSelectionTimeoutMS=5000)
            # Verify connection
            self._client.admin.command("ping")
            self._db = self._client[db_name]
            self._init_collections()
            print(f"✓ MongoDB connected: {db_name}")
        except Exception as e:
            print(f"⚠ MongoDB connection failed. Using mock mode. Error: {str(e)}")
            self._client = None
            self._db = None

    def _init_collections(self):
        """Create collections and indexes."""
        if self._db is None:
            return

        # Users collection
        if "users" not in self._db.list_collection_names():
            self._db.create_collection("users")
            self._db["users"].create_index("email", unique=True)

        # Documents collection
        if "documents" not in self._db.list_collection_names():
            self._db.create_collection("documents")
            self._db["documents"].create_index("user_id")
            self._db["documents"].create_index("uploaded_at")

        # Schemes collection
        if "schemes" not in self._db.list_collection_names():
            self._db.create_collection("schemes")
            self._db["schemes"].create_index("scheme_name", unique=True)

        # Eligibility Results collection
        if "eligibility_results" not in self._db.list_collection_names():
            self._db.create_collection("eligibility_results")
            self._db["eligibility_results"].create_index([("user_id", 1), ("scheme_id", 1)])

        # Processing Queue collection
        if "processing_queue" not in self._db.list_collection_names():
            self._db.create_collection("processing_queue")
            self._db["processing_queue"].create_index("status")

    @property
    def db(self) -> Optional[Database]:
        """Get database instance."""
        return self._db

    @property
    def client(self) -> Optional[MongoClient]:
        """Get client instance."""
        return self._client

    def close(self):
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None


def get_db() -> Optional[Database]:
    """Get MongoDB database instance."""
    connector = MongoDBConnector()
    return connector.db
