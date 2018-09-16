from doit import get_var
from doit.action import CmdAction

VERSION = get_var('version', 'test')

def title(name):
    def r(f):
        def call():
            d = f()
            d['title'] = lambda _: name
            return d
        return call
    return r

@title('[git] update')
def task_pull():
    return {
        'actions':[
            'cd view; git pull',
            'cd server; git pull'
        ]
    }

@title('[view] dependencies')
def task_install():
    return {
        'actions':[
            'cd view; npm install'
        ],
        'targets': ['view/node_modules'],
        'file_dep': ['view/package.json'],
        'task_dep':[
            'pull'
        ]
    }

@title('[view] package')
def task_package():
    return {
        'task_dep': ['install'],
        'actions': [
            'cd view; npm run build'
        ]
    }

@title('[docker] Create sqlite image')
def task_sqlite():
    return {
        'task_dep': ['package'],
        'actions': [
            'docker build -t dracks/mrscrooge:{} -f config/sqlite/Dockerfile .'.format(VERSION)
        ]
    }

@title('[docker] Upload sqlite image')
def task_sqlite_upload():
    return {
        'task_dep': ['sqlite'],
        'actions':[
            'docker push dracks/mrscrooge:{}'.format(VERSION)
        ]
    }