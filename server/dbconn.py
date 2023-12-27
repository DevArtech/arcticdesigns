from pymongo import MongoClient
from typing import Dict, List

class DBConn:
    def __init__(self):
        self.client = MongoClient("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000")

    def get_db(self, db_name: str):
        return self.client[db_name]
    
    def get_collection(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name]
    
    def get_all_collections(self, db_name: str):
        return self.client[db_name].list_collection_names()
    
    def get_all_dbs(self):
        return self.client.list_database_names()
    
    def get_all_docs(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name].find()
    
    def get_doc(self, db_name: str, collection_name: str, doc_id: str):
        return self.client[db_name][collection_name].find_one({'_id': doc_id})
    
    def insert_doc(self, db_name: str, collection_name: str, doc: Dict[any, any]):
        return self.client[db_name][collection_name].insert_one(doc)
    
    def update_one(self, db_name: str, collection_name: str, doc_id: str, new_doc: str):
        old_doc = self.get_doc(db_name, collection_name, doc_id)
        return self.cleint[db_name][collection_name].update_one(old_doc, new_doc)

    def update_many(self, db_name: str, collection_name: str, regex: str, new_doc: str):
        return self.client[db_name][collection_name].update_many(regex, new_doc)
    
    def delete_one(self, db_name: str, collection_name: str, doc_id: str):
        return self.client[db_name][collection_name].delete_one({"_id": doc_id})
    
    def delete_many(self, db_name: str, collection_name: str):
        return self.client[db_name][collection_name].delete_many({})


