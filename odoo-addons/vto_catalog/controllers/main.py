import json
# pyrefly: ignore [missing-import]
from odoo import http
# pyrefly: ignore [missing-import]
from odoo.http import request, Response


class VTOCatalogAPI(http.Controller):
    """
    REST API Controller untuk VTO Catalog.
    
    Endpoints:
        GET  /api/vto/glasses        → List semua kacamata yang published
        GET  /api/vto/glasses/<id>   → Detail satu kacamata
        GET  /api/vto/health         → Health check

    Semua response dalam format JSON.
    CORS diaktifkan agar React app di localhost:5173 bisa akses.
    """

    def _cors_headers(self):
        """Return CORS headers agar React frontend bisa akses API ini."""
        return {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json',
        }

    def _json_response(self, data, status=200):
        """Helper untuk membuat JSON response dengan CORS headers."""
        return Response(
            json.dumps(data, ensure_ascii=False),
            status=status,
            headers=self._cors_headers(),
        )

    # ── Health Check ────────────────────────────────────────────
    @http.route('/api/vto/health', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def health_check(self, **kwargs):
        """Health check endpoint — untuk verifikasi bahwa API berjalan."""
        if request.httprequest.method == 'OPTIONS':
            return Response('', status=200, headers=self._cors_headers())

        return self._json_response({
            'status': 'ok',
            'message': 'VTO Catalog API is running',
            'version': '1.0.0',
        })

    # ── List All Glasses ────────────────────────────────────────
    @http.route('/api/vto/glasses', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def list_glasses(self, **kwargs):
        """
        GET /api/vto/glasses
        
        Response:
        {
            "success": true,
            "count": 5,
            "data": [
                {
                    "id": 1,
                    "name": "Bonia Classic Black",
                    "sku": "BN-001",
                    "brand": "Bonia",
                    "price": 1500000,
                    ...
                },
                ...
            ]
        }
        """
        if request.httprequest.method == 'OPTIONS':
            return Response('', status=200, headers=self._cors_headers())

        try:
            # Gunakan sudo() karena auth='none' (public access, tanpa login)
            glasses = request.env['glasses.product'].sudo().search([
                ('is_published', '=', True)
            ])

            data = [g.to_api_dict() for g in glasses]

            return self._json_response({
                'success': True,
                'count': len(data),
                'data': data,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e),
            }, status=500)

    # ── Get Single Glasses ──────────────────────────────────────
    @http.route('/api/vto/glasses/<int:glasses_id>', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def get_glasses(self, glasses_id, **kwargs):
        """
        GET /api/vto/glasses/1
        
        Response:
        {
            "success": true,
            "data": {
                "id": 1,
                "name": "Bonia Classic Black",
                ...
            }
        }
        """
        if request.httprequest.method == 'OPTIONS':
            return Response('', status=200, headers=self._cors_headers())

        try:
            glasses = request.env['glasses.product'].sudo().browse(glasses_id)

            if not glasses.exists() or not glasses.is_published:
                return self._json_response({
                    'success': False,
                    'error': 'Product not found',
                }, status=404)

            return self._json_response({
                'success': True,
                'data': glasses.to_api_dict(),
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e),
            }, status=500)

    # ── List Featured Glasses ───────────────────────────────────
    @http.route('/api/vto/glasses/featured', type='http', auth='none', methods=['GET', 'OPTIONS'], csrf=False)
    def list_featured(self, **kwargs):
        """GET /api/vto/glasses/featured — Hanya kacamata unggulan."""
        if request.httprequest.method == 'OPTIONS':
            return Response('', status=200, headers=self._cors_headers())

        try:
            glasses = request.env['glasses.product'].sudo().search([
                ('is_published', '=', True),
                ('is_featured', '=', True),
            ])

            data = [g.to_api_dict() for g in glasses]

            return self._json_response({
                'success': True,
                'count': len(data),
                'data': data,
            })
        except Exception as e:
            return self._json_response({
                'success': False,
                'error': str(e),
            }, status=500)
