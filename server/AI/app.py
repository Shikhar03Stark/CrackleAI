from flask import Flask


app = Flask(__name__)




@app.route('/')
def hello():
    return "Crackle AI server successfully started"

if __name__ == "__main__":
    app.run()