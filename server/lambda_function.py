import re
import os
import json
import time
import uuid
import awsgi
import random
import hashlib
import requests
from dbconn import DBConn
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
from product_manager import ProductManager
from authlib.integrations.flask_client import OAuth
from flask import Flask, jsonify, request, url_for, redirect, abort
load_dotenv()

# App Instance
app = Flask(__name__)
oauth = OAuth(app)
dbconn = DBConn()
CORS(app)
pm = ProductManager()

google = oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

app.secret_key = os.getenv('SECRET_KEY')

@app.route('/login/google')
def login():
    return google.authorize_redirect(redirect_uri=url_for('v1/authorize', _external=True))

@app.route('/v1/authorize', endpoint='/v1/authorize')
@app.route('/v1/authorize', endpoint='v1/authorize', defaults={'query': None})
@app.route('/v1/authorize/<query>', endpoint='v1/authorize')
def authorize(query: str):
    if query:
        match = re.search(r"&code=([^&]+)&scope=", query)
        code = match.group(1) if match else None
        if code:
            token = google.authorize_access_token()
            url = "https://people.googleapis.com/v1/people/me?personFields=emailAddresses"

            # Set up the headers with the access token
            headers = {
                "Authorization": f"Bearer {token['access_token']}",
                "Accept": "application/json"
            }

            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                email_addresses = response.json().get("emailAddresses", [])
                if email_addresses:
                    return redirect(f"{os.getenv('MAIN_URI')}/#/login?{google_login_user(email_addresses[0]['value'])}")
                else:
                    return "No email address found"
            else:
                return f"Error: {response.status_code}"

        else:
            abort(400)

def google_login_user(email: str):
    account = dbconn.get_doc("accounts", "users", {"email": email})
    need_additional_info = False
    if not account:
        account = {
            "user_id": str(uuid.uuid4()) + "-" + str(int(time.time_ns())),
            "username": email.split("@")[0],
            "email": email,
            "password": "",
            "salt": os.urandom(16),
            "previous_orders": [],
            "login_token": "",
            "token_expiration": ""
        }
        need_additional_info = True
        dbconn.insert_doc("accounts", "users", account)

    token = str(uuid.uuid4()) + "-" + str(int(time.time_ns()))
    expiration = (datetime.now() + timedelta(minutes=(10 if need_additional_info else 1440))).strftime("%Y-%m-%d %H:%M:%S")
    dbconn.update_one("accounts", "users", {"email": email}, {"$set": {"login_token": token, "token_expiration": expiration}})

    return f"user={account['username']}&need-add-info={need_additional_info}&token={token}"

@app.route("/api/accounts/signup", methods=["POST"])
def signup_user():
    username = request.json["username"]
    email = request.json["email"]
    password = request.json["password"]
    salt = os.urandom(16)
    check_if_user_exists = dbconn.get_doc("accounts", "users", {"email": email})
    if check_if_user_exists:
        abort(400)

    check_if_user_taken = dbconn.get_doc("accounts", "users", {"username": username})
    if check_if_user_taken:
        abort(409)

    salted_password = salt + password.encode()
    hash_obj = hashlib.sha256(salted_password)
    hashed_password = hash_obj.hexdigest()

    account = {
        "user_id": str(uuid.uuid4()) + "-" + str(int(time.time_ns())),
        "username": username,
        "email": email,
        "password": hashed_password,
        "salt": salt,
        "previous_orders": [],
        "login_token": str(uuid.uuid4()) + "-" + str(int(time.time_ns())),
        "token_expiration": (datetime.now() + timedelta(minutes=1440)).strftime("%Y-%m-%d %H:%M:%S")
    }
    dbconn.insert_doc("accounts", "users", account)
    return jsonify({"username": account["username"], "token": account["login_token"]})

@app.route("/api/accounts/login", methods=["POST"])
def login_user():
    username = request.json["username"]
    password = request.json["password"]
    if "@" in username:
        account = dbconn.get_doc("accounts", "users", {"email": username})
    else:
        account = dbconn.get_doc("accounts", "users", {"username": username})
    salt = account["salt"]
    salted_password = salt + password.encode()
    hash_obj = hashlib.sha256(salted_password)
    hashed_password = hash_obj.hexdigest()

    if account["password"] == hashed_password:
        token = str(uuid.uuid4()) + "-" + str(int(time.time_ns()))
        expiration = (datetime.now() + timedelta(minutes=1440)).strftime("%Y-%m-%d %H:%M:%S")
        dbconn.update_one("accounts", "users", {"username": username}, {"$set": {"login_token": token, "token_expiration": expiration}})
        return jsonify({"username": account["username"], "token": token})
    else:
        abort(401)

@app.route("/api/accounts/complete-signup", methods=["POST"])
def complete_signup():
    token = request.json["token"]
    username = request.json["username"]
    password = request.json["password"]
    account = dbconn.get_doc("accounts", "users", {"login_token": token})

    salted_password = account["salt"] + password.encode()
    hash_obj = hashlib.sha256(salted_password)
    hashed_password = hash_obj.hexdigest()

    if dbconn.get_doc("accounts", "users", {"username": username}):
        abort(400)

    if account:
        if datetime.strptime(account["token_expiration"], "%Y-%m-%d %H:%M:%S") > datetime.now():
            account["username"] = username
            account["password"] = hashed_password
            account["login_token"] = str(uuid.uuid4()) + "-" + str(int(time.time_ns()))
            account["token_expiration"] = (datetime.now() + timedelta(minutes=1440)).strftime("%Y-%m-%d %H:%M:%S")
            dbconn.update_one("accounts", "users", {"login_token": token}, {"$set": account})
            return jsonify({"username": account["username"], "token": account["login_token"]})
        else:
            abort(401)
    else:
        abort(400)
    
@app.route("/api/products/total-count", methods=["GET"])
def get_product_count():
    return jsonify(pm.get_product_count())

@app.route("/api/products/get-random-products/<quantity>", methods=["GET"])
def get_random_products(quantity: int = 0):
    collections = dbconn.get_all_collections("products")
    products = []
    for collection in collections:
        if collection != "misc_data":
            cursor = dbconn.get_all_docs("products", collection)
            for product in cursor:
                # Append all keys except _id
                products.append({key: product[key] for key in product if key != "_id"})
                # Append _id as a string
                products[-1]["id"] = str(product["_id"])
    random.shuffle(products)
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/products/<collection>/<quantity>", methods=["GET"])
def get_amount_from_collection(collection: str, quantity: int):
    cursor = dbconn.get_all_docs("products", collection)
    products = []
    for product in cursor:
        # Append all keys except _id
        products.append({key: product[key] for key in product if key != "_id"})
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/misc-data/available-colors", methods=["GET"])
def get_available_colors():
    colors = dbconn.get_doc("products", "misc_data", {"prod_id": "000001"})['colors']
    return jsonify(colors)

@app.route("/api/products/get-user-recommended-item", methods=["GET"])
def get_recommended_item():
    products = get_random_products()
    return jsonify(products.json[0])

@app.route("/api/products/get-products-not/<collection>/<quantity>", methods=["POST"])
def get_products_not(collection: str, quantity: int):
    excluded_products = request.json
    products = []
    cursor = dbconn.get_all_docs("products", collection)
    for product in cursor:
        if product["prod_id"] not in excluded_products:
            # Append all keys except _id
            products.append({key: product[key] for key in product if key != "_id"})
    random.shuffle(products)
    return jsonify(products[:int(quantity)] if int(quantity) > 0 else products)

@app.route("/api/products/add-comment/<prod_id>", methods=["POST"])
def add_comment(prod_id: str):
    collection = pm.locate_product_collection(prod_id)
    comment = request.json
    prior_comments = pm.get_product(prod_id)["comments"]
    if prior_comments is None:
        prior_comments = []
    prior_comments.append(comment)
    result = dbconn.update_one("products", collection, {"prod_id": prod_id}, {"$set": {"comments": prior_comments}})
    return jsonify({"success": result.acknowledged})

@app.route("/api/products/get-collections", methods=["GET"])
def get_collections():
    return jsonify(pm.get_all_collections())

@app.route("/api/products/get-product/<product_id>", methods=["GET"])
def get_product(product_id: str):
    product = pm.get_product(product_id)
    product["comments"] = product["comments"][::-1]
    return jsonify({key: product[key] for key in product if key != "_id"})

@app.route("/api/products/get-product-collection/<product_id>", methods=["GET"])
def get_product_collection(product_id: str):
    return jsonify(pm.locate_product_collection(product_id))

def lambda_handler(event, context):
    return awsgi.response(app, event, context)

# dbconn.update_one("products", collection, {"_id" : product["_id"]}, {"$set": {"prod_id": str(uuid.uuid4()) + "-" + str(int(time.time_ns()))}})

if __name__ == "__main__":
    app.run(debug=True, port=8080)