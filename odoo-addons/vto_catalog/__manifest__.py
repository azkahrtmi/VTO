{
    'name': 'VTO Catalog',
    'version': '18.0.1.0.0',
    'category': 'Website',
    'summary': 'Headless CMS API untuk Virtual Try-On Catalog',
    'description': """
        Module ini menyediakan:
        - Model data kacamata (glasses.product)
        - REST API endpoint untuk React frontend
        - Admin UI untuk kelola catalog kacamata
        
        API Endpoints:
        - GET /api/vto/glasses → List semua kacamata
        - GET /api/vto/glasses/<id> → Detail satu kacamata
    """,
    'author': 'VTO Team',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/glasses_views.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
