from flask import Flask, request
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.restless import APIManager
#from flask.ext.login import current_user, login_user, LoginManager, UserMixin
#from flask.ext.wtf import PasswordField, SubmitField, TextField, Form
from werkzeug import secure_filename
import os

UPLOAD_FOLDER = '/Users/mvbeck/projetos/comic-reader/uploads'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

db = SQLAlchemy(app)
api_manager = APIManager(app, flask_sqlalchemy_db=db)


#SQLAlchemy models
class Author(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Unicode)


class Comic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode, unique=True)
    author_id = db.Column(db.Integer, db.ForeignKey('author.id'))
    author = db.relationship('Author', backref=db.backref('comics', lazy='dynamic'))


class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Unicode)
    comic_id = db.Column(db.Integer, db.ForeignKey('comic.id'))
    comic = db.relationship('Comic', backref=db.backref('chapters', lazy='dynamic'))


class Page(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.Unicode)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'))
    chapter = db.relationship('Chapter', backref=db.backref('pages', lazy='dynamic'))


#handle file upload
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload',methods=['POST'])
def upload():
    filepage = request.files['file']
    if filepage and allowed_file(filepage.filename):
        file = secure_filename(filepage.filename)
        filepage.save(os.path.join(app.config['UPLOAD_FOLDER'], file))
        return file
    return 'error'


#create db
db.create_all()

#create API endpoints
api_manager.create_api(Author, methods=['GET','POST','PATCH','DELETE'])
api_manager.create_api(Comic, methods=['GET','POST','PATCH','DELETE'])
api_manager.create_api(Chapter, methods=['GET','POST','PATCH','DELETE'])
api_manager.create_api(Page, methods=['GET','POST','PATCH','DELETE'])

#run app
app.run()