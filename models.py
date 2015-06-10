from peewee import *

db = SqliteDatabase('mydb.db', threadlocals=True)


class BaseModel(Model):
    class Meta:
        database = db


class Folder(BaseModel):
    id = IntegerField(primary_key=True)
    name = CharField(max_length=64, unique=True)


class File(BaseModel):
    folder = ForeignKeyField(Folder, related_name='files')
    filename = CharField()


def create_all_tables():
    db.connect()
    db.create_tables([Folder, File])

if __name__ == '__main__':
    create_all_tables()
