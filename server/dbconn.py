from pymongo import MongoClient
from typing import Dict, List
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

class DBConn:
    def __init__(self):
        load_dotenv()
        self.client = MongoClient(os.getenv("ATLAS_URI"))

    def get_db(self, db_name: str):
        return self.client[db_name]
    
    def get_collection(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name]
    
    def get_all_collections(self, db_name: str):
        return self.client[db_name].list_collection_names()
    
    def get_all_dbs(self):
        return self.client.list_database_names()
    
    def get_all_docs(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name].find({})
    
    def get_doc(self, db_name: str, collection_name: str, regex: Dict[str, str]):
        return self.client[db_name][collection_name].find_one(regex)
    
    def insert_doc(self, db_name: str, collection_name: str, doc: Dict[any, any]):
        return self.client[db_name][collection_name].insert_one(doc)
    
    def update_one(self, db_name: str, collection_name: str, regex: str, new_doc: str):
        """
        Example:
        regex = {"_id": document["_id"]}
        new_doc = {"$set": {"name": "new_name"}}
        """
        return self.client[db_name][collection_name].update_one(regex, new_doc)

    def update_many(self, db_name: str, collection_name: str, regex: str, new_doc: str):
        return self.client[db_name][collection_name].update_many(regex, new_doc)
    
    def delete_one(self, db_name: str, collection_name: str, doc_id: str):
        return self.client[db_name][collection_name].delete_one({"prod_id": doc_id})
    
    def delete_many(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name].delete_many({})


