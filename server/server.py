from dbconn import DBConn
from flask import Flask, jsonify, request
from flask_cors import CORS

# App Instance
app = Flask(__name__)
dbconn = DBConn()
CORS(app)

@app.route("/api/home", methods=["GET"])
def return_home():
    return jsonify({
        'message' : 'This is a test!'
    })

@app.route("/api/v1/submit", methods=["POST"])
def log_user_data():
    user_data = request.json
    # dbconn.delete_many("account", "user")
    response = dbconn.insert_doc("account", "user", {"username" : user_data["username"], "password" : user_data["password"]})
    if response.acknowledged:
        logs = []
        for log in dbconn.get_all_docs("account", "user"):
            logs.append({"username" : log["username"], "password": log["password"]})

        return jsonify(logs)
    return "Error inserting user"

if __name__ == "__main__":
    app.run(debug=True, port=8080)