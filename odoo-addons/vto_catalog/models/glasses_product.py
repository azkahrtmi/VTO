# pyrefly: ignore [missing-import]
from odoo import models, fields, api
import base64


class GlassesProduct(models.Model):
    """
    Model untuk menyimpan data kacamata yang bisa dikelola dari Odoo CMS.
    Data ini akan di-serve ke React frontend via REST API.
    """
    _name = 'glasses.product'
    _description = 'VTO Glasses Product'
    _order = 'sequence, name'

    # ── Basic Info ──────────────────────────────────────────────
    name = fields.Char(
        string='Nama Kacamata',
        required=True,
        help='Nama produk kacamata (tampil di frontend)'
    )
    sku = fields.Char(
        string='SKU',
        required=True,
        help='Stock Keeping Unit — kode unik produk'
    )
    brand = fields.Char(
        string='Brand',
        help='Merek kacamata (misal: Bonia, RayBan)'
    )
    description = fields.Text(
        string='Deskripsi',
        help='Deskripsi produk untuk halaman detail'
    )

    # ── Pricing ─────────────────────────────────────────────────
    price = fields.Float(
        string='Harga (IDR)',
        required=True,
        default=0.0,
        help='Harga dalam Rupiah'
    )
    price_discount = fields.Float(
        string='Harga Diskon (IDR)',
        default=0.0,
        help='Harga setelah diskon (0 = tidak ada diskon)'
    )

    # ── Visual ──────────────────────────────────────────────────
    color = fields.Char(
        string='Warna',
        help='Warna utama frame (misal: Black, Gold, Tortoise)'
    )
    color_hex = fields.Char(
        string='Warna Hex',
        default='#000000',
        help='Kode warna hex untuk UI (misal: #FF5733)'
    )
    image = fields.Binary(
        string='Gambar Produk',
        help='Upload gambar thumbnail kacamata'
    )
    image_filename = fields.Char(
        string='Nama File Gambar'
    )

    # ── VTO Config ──────────────────────────────────────────────
    model_3d_url = fields.Char(
        string='URL Model 3D (.glb)',
        help='URL ke file GLB untuk virtual try-on (misal: /coba4.glb)'
    )
    deepar_effect_url = fields.Char(
        string='URL DeepAR Effect (.deepar)',
        help='URL ke file .deepar untuk DeepAR engine'
    )
    engine = fields.Selection(
        [('mindar', 'MindAR'), ('deepar', 'DeepAR')],
        string='AR Engine',
        default='deepar',
        required=True,
        help='Engine AR yang digunakan untuk model ini'
    )

    # ── Category & Status ───────────────────────────────────────
    category = fields.Selection(
        [
            ('optical', 'Kacamata Optik'),
            ('sunglasses', 'Kacamata Hitam'),
            ('sports', 'Kacamata Olahraga'),
        ],
        string='Kategori',
        default='optical',
    )
    is_published = fields.Boolean(
        string='Tampilkan di Website',
        default=True,
        help='Jika tidak dicentang, produk tidak akan muncul di frontend'
    )
    is_featured = fields.Boolean(
        string='Produk Unggulan',
        default=False,
        help='Tampilkan di section featured/best seller'
    )
    sequence = fields.Integer(
        string='Urutan',
        default=10,
        help='Urutan tampil di catalog (angka kecil = tampil duluan)'
    )

    # ── Method untuk API response ───────────────────────────────
    def to_api_dict(self):
        """Convert record ke dictionary untuk JSON API response."""
        self.ensure_one()
        result = {
            'id': self.id,
            'name': self.name,
            'sku': self.sku,
            'brand': self.brand or '',
            'description': self.description or '',
            'price': self.price,
            'price_discount': self.price_discount,
            'color': self.color or '',
            'color_hex': self.color_hex or '#000000',
            'model_3d_url': self.model_3d_url or '',
            'deepar_effect_url': self.deepar_effect_url or '',
            'engine': self.engine,
            'category': self.category,
            'is_featured': self.is_featured,
        }
        # Include image as base64 data URL if exists
        if self.image:
            result['image_url'] = f'data:image/png;base64,{self.image.decode("utf-8")}'
        else:
            result['image_url'] = ''
        return result
