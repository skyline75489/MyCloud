import os
from functools import wraps

from flask import Flask, request, render_template, jsonify, send_from_directory

from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)


from werkzeug import secure_filename

from models import Folder, File

import peewee
import qrcode

from utils import generate_url, generate_password


app = Flask(__name__)
app.config.from_object('config')


def test_authorization():
    cookies = request.cookies
    headers = request.headers
    args = request.args
    token = None
    if 'token' in cookies:
        token = cookies['token']
    elif 'Authorization' in headers:
        token = headers['Authorization']
    elif 'token' in args:
        token = args['token']
    else:
        return False

    return verify_auth_token(token)


def authorization_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not test_authorization():
            return jsonify(message='Not Authorized'), 401
        return f(*args, **kwargs)
    return wrapper


def verify_auth_token(token):
    s = Serializer(app.config['SECRET_KEY'])
    try:
        data = s.loads(token)
    except SignatureExpired:
        return None  # valid token, but expired
    except BadSignature:
        return None  # invalid token
    return data['key'] == app.config['SECRET_KEY']


@app.route('/login', methods=['POST'])
def login():
    req = request.get_json()
    if req['email'] == app.config['EMAIL'] and req['password'] == app.config['PASSWORD']:
        # Login OK
        # Expires in 1 week
        s = Serializer(app.config['SECRET_KEY'], expires_in=7 * 24 * 3600)

        return jsonify(message='OK',
                       token=s.dumps({'key': app.config['SECRET_KEY']}))
    else:
        return jsonify(message='error'), 403


@app.route('/login/testAuth', methods=['GET'])
def test_auth():
    if test_authorization():
        return jsonify(message='OK')
    else:
        return jsonify(message='Not Authorized'), 401


@app.route('/folders', methods=['GET', 'POST'])
@authorization_required
def folders():
    if request.method == 'POST':
        req = request.get_json()
        try:
            f = Folder.create(name=req['name'])
            f.save()
            return jsonify(message='OK'), 201
        except peewee.IntegrityError as e:
            print e
            return jsonify(message='error'), 409

    if request.method == 'GET':
        folders = Folder.select()
        items = [x.name for x in folders]
        return jsonify(message='OK', items=items)


@app.route('/folders/<folder_name>', methods=['GET', 'POST', 'DELETE'])
@authorization_required
def folder(folder_name):
    try:
        f = Folder.get(name=folder_name)
    except peewee.DoesNotExist:
        return jsonify(message='error'), 404

    if request.method == 'POST':
        file = request.files['file']
        if file:
            actual_filename = secure_filename(
                folder_name + '_' + file.filename)
            if os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], actual_filename)):
                return jsonify(message='error'), 409
            file.save(
                os.path.join(app.config['UPLOAD_FOLDER'], actual_filename))
            f2 = File.create(folder=folder_name,
                             filename=file.filename,
                             public_share_url=generate_url(),
                             private_share_url=generate_url(),
                             private_share_password=generate_password(),
                             open_public_share=False,
                             open_private_share=False)
            f2.save()
            return jsonify(message='OK'), 201

    if request.method == 'GET':
        files = File.select().where(File.folder == folder_name)
        items = [{
            'filename': x.filename,
            'public': x.public_share_url,
            'private': x.private_share_url,
            'password': x.private_share_password,
            'openPublic': x.open_public_share,
            'openPrivate': x.open_private_share
        } for x in files]

        return jsonify(message='OK', items=items)

    if request.method == 'DELETE':
        try:
            f.delete_instance()
        except peewee.IntegrityError:
            return jsonify(message='error'), 409
        return jsonify(message='OK')


@app.route('/folders/<folder_name>/<filename>', methods=['GET', 'DELETE', 'PUT'])
@authorization_required
def files(folder_name, filename):
    actual_filename = secure_filename(folder_name + '_' + filename)

    try:
        f = File.get(filename=filename)
    except peewee.DoesNotExist:
        return jsonify(message='error'), 404

    if request.method == 'GET':
        args = request.args
        if 'query' in args and args['query'] == 'info':
            payload = {
                'filename': f.filename,
                'public': f.public_share_url,
                'private': f.private_share_url,
                'password': f.private_share_password,
                'openPublic': f.open_public_share,
                'openPrivate': f.open_private_share
            }
            return jsonify(message='OK', payload=payload)

        return send_from_directory(app.config['UPLOAD_FOLDER'], actual_filename)

    if request.method == 'DELETE':

        actual_filename = secure_filename(folder_name + '_' + filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], actual_filename)

        if os.path.exists(file_path):
            f.delete_instance()
            os.remove(file_path)
            return jsonify(message='OK')
        else:
            return jsonify(message='error'), 404

    if request.method == 'PUT':
        req = request.get_json()
        share_type = req['shareType']
        if share_type == 'openPrivate':
            f.open_private_share = True
            f.open_public_share = False
        elif share_type == 'openPublic':
            f.open_private_share = False
            f.open_public_share = True
        elif share_type == 'None':
            f.open_public_share = False
            f.open_private_share = False
        f.save()
        return jsonify(message='OK')


@app.route('/share/<path>', methods=['GET'])
def doShare(path):
    is_private = False
    is_public = False

    try:
        f = File.get(File.public_share_url == path)
        is_public = True
    except peewee.DoesNotExist:
        try:
            f = File.get(File.private_share_url == path)
            is_private = True
        except peewee.DoesNotExist:
            return jsonify(message='error'), 404

    if not ((is_public and f.open_public_share) or (is_private and f.open_private_share)):
        return jsonify(message='error'), 404

    s = Serializer(app.config['SECRET_KEY'])
    token = s.dumps({'path': path, 'key': app.config['SECRET_KEY']})
    
    args = request.args

    payload = {
        'filename': f.filename,
        'folder': f.folder.name,
        'openPublic': f.open_public_share,
        'openPrivate': f.open_private_share,
        'token': token,
    }
    
    if 'password' in args:
        if args['password'] == f.private_share_password:
            return jsonify(message='OK')
        else:
            return jsonify(message='error'), 401
    elif is_private:
        payload['token'] = ''
        
    return jsonify(message='OK', payload=payload)


@app.route('/qr', methods=['GET'])
def gen_qrcode():
    args = request.args
    data = args['d']
    img = qrcode.make(data)
    filename = str(hash(data)) + '.png'
    path = os.path.join(app.config['QRCODE_FOLDER'], filename)
    if not os.path.exists(path):
        img.save(path)

    return send_from_directory(app.config['QRCODE_FOLDER'], filename)


@app.route('/s/<path>', methods=['GET'])
def share(path):
    return render_template('share.html')


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
