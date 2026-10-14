import sys
sys.path.insert(0, '.')
from backend.services.mysql_service import MySQLService
from backend.services.mongo_service import MongoService
from backend.services.analytical_service import AnalyticalService
from backend.app import create_app

print('MySQL test:', MySQLService.test_connection())
print('Mongo test:', MongoService.test_connection())

app = create_app()
client = app.test_client()

endpoints = [
    '/api/health',
    '/api/overview',
    '/api/teams',
    '/api/teams/performance',
    '/api/toss',
    '/api/venues',
    '/api/venues/performance',
    '/api/seasons',
    '/api/insights',
    '/api/data-quality',
    '/api/sources/status'
]

for ep in endpoints:
    res = client.get(ep)
    print(ep, '->', res.status_code, 'bytes:', len(res.data))
    if res.status_code != 200:
        print('   Error:', res.data)

