from flask import Flask, request, render_template, jsonify

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

app = Flask(__name__)
app.config.from_object('config')

def verify_auth_token(token):
    s = Serializer(app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token
    return data['id']


@app.route('/login', methods=['POST'])
def login():
    req_json = request.get_json()
    s = Serializer(app.config['SECRET_KEY'], expires_in=7 * 24 * 3600)  # Expires in 1 week
    return jsonify(message='OK',
                   token=s.dumps({'id': 124}))


@app.route('/login/testAuth', methods=['GET'])
def test_auth():
    cookies = request.cookies
    if verify_auth_token(cookies['token']) is not None:
        return jsonify(message='OK')
    else:
        return jsonify(message='Not Authorized')


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
