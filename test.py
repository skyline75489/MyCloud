import os
import unittest
import tempfile
import json

from app import app
from models import Folder, create_all_tables


class BaseTestCase(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        create_all_tables()

    def test_login(self):
        email = app.config['EMAIL']
        password = app.config['PASSWORD']
        rv = self.client.post('/login', data=dict(
                    email=email,
                    password=password
                ))
        data = json.loads(rv.data)
        assert data['message'] == 'OK'

    def tearDown(self):
        os.remove('mydb.db')

if __name__ == '__main__':
    unittest.main()
