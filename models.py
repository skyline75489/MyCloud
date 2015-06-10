from peewee import *

db = SqliteDatabase('mydb.db', threadlocals=True)


class BaseModel(Model):
    class Meta:
        database = db


class Folder(BaseModel):
    name = CharField(max_length=64)


def create_all_tables():
    Folder.create_table()

    
