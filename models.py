from peewee import *

db = SqliteDatabase('mydb.db', threadlocals=True)


class BaseModel(Model):
    class Meta:
        database = db


class Folder(BaseModel):
    name = CharField(max_length=64, unique=True)


class File(BaseModel):
    folder = ForeignKeyField(Folder, related_name='files', to_field='name')
    filename = CharField()
    public_share_url = CharField()
    private_share_url = CharField()
    private_share_password = CharField()
    open_public_share = BooleanField()
    open_private_share = BooleanField()
    

def create_all_tables():
    db.connect()
    db.create_tables([Folder, File])

if __name__ == '__main__':
    create_all_tables()
